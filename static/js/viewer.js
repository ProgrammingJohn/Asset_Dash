var calendar;
var tableBody;

function getSlingEvents() {
  return new Promise((resolve, reject) => {
    fullCalendarEvents = [];
    $.ajax({
      url: "/utils/sling-events",
      method: "GET",
      dataType: "json",
      data: {
        days_in_advance: 21,
      },
      success: function (data) {
        data.forEach((event) => {
          title = "";
          if (event.worker) {
            title = `${event.location_name} | ${event.worker.first_name} ${event.worker.last_name}`;
          } else {
            title = event.location_name;
          }
          fullCalendarEvents.push({
            id: event.id,
            title: title,
            start: event.date_start,
            end: event.date_end,
            className: "slingEvent",
          });
        });
        resolve(fullCalendarEvents);
      },
      error: function (xhr, status, error) {
        console.error("Error:", status, error);
        reject(error);
      },
    });
  });
}

function updateCalender() {
  calendar.getEventSourceById("googleCalendar").refetch();
  calendar.getEventSourceById("slingCalendar").refetch();
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

async function main() {
  tableBody = $("#table_scroll tbody");
  slingEvents = await getSlingEvents();
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

    eventSources: [
      {
        id: "googleCalendar",
        googleCalendarApiKey: "AIzaSyB6XMk7lITvTNeZUGMWl69y7sK-3d7iLRY",
        googleCalendarId:
          "da4efe4dd6407df36a9ee998e116aae9d1eaf02f0e11d7093f7b17b74872a511@group.calendar.google.com",
        className: "googleCalendarEvent",
      },
      {
        id: "slingCalendar",
        events: async function (fetchInfo, successCallback, failureCallback) {
          try {
            slingEvents = await getSlingEvents();
            successCallback(slingEvents);
          } catch (error) {
            console.error("Error fetching Sling API events:", error);
            failureCallback(error);
          }
        },
      },
    ],
  });

  setInterval(updateCalender, 15000);
  setInterval(fetchData, 15000);
  fetchData();
  calendar.render();
  pageScroll();
}

$(document).ready(function () {
  main();
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
    url: "/assets/out",
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
