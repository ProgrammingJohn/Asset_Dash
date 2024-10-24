var calendar;
var tableBody;

function updateCalender() {
  calendar.refetchEvents();
}

function updateTable(data) {
  tableBody.empty();
  $.each(data, function (index, asset) {
    const row = $("<tr></tr>");
    const columns = [
      asset.asset_id,
      asset.name,
      asset.type,
      asset.checked_out_by,
      asset.time_checked,
    ];
    $.each(columns, function (index, columnData) {
      const cell = $("<td></td>").text(columnData);
      row.append(cell);
    });
    tableBody.append(row);
  });
}

$(document).ready(function () {
  tableBody = $("#table_scroll tbody");
  const calendarEl = document.getElementById("calendar");
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridFourWeek",
    views: {
      dayGridFourWeek: {
        type: "dayGrid",
        duration: { weeks: 3 },
      },
    },
    height: 590,
    headerToolbar: false,
    displayEventEnd: true,
    timeZone: "ETC",
    googleCalendarApiKey: "AIzaSyB6XMk7lITvTNeZUGMWl69y7sK-3d7iLRY",
    events: {
      googleCalendarId:
        "da4efe4dd6407df36a9ee998e116aae9d1eaf02f0e11d7093f7b17b74872a511@group.calendar.google.com",
    },
  });

  setInterval(updateCalender, 15000);
  setInterval(fetchData, 15000);
  fetchData();
  calendar.render();
  pageScroll();
});

var my_time;
var dir = 1;
var prev;

function pageScroll() {
  var objDiv = $("#contain");
  prev = objDiv.scrollTop();
  objDiv.scrollTop(objDiv.scrollTop() + dir);
  if (objDiv.scrollTop() == 0 || objDiv.scrollTop() == prev) {
    dir *= -1;
  }
  my_time = setTimeout(pageScroll, 55);
}

function fetchData() {
  $.ajax({
    url: "/api/get/assets/out",
    method: "GET",
    dataType: "json",
    success: function (data) {
      updateTable(data);
    },
    error: function (xhr, status, error) {
      console.error("Error:", status, error);
    },
  });
}
