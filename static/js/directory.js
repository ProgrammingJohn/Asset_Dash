$(document).ready(function () {
  var infoUpdateDelay = 30000;

  updateTable();

  setInterval(() => {
    updateTable();
  }, infoUpdateDelay);
});

function updateTable() {
  $("#table-content").empty();
  $.ajax({
    url: "/api/get/assets/all",
    method: "GET",
    dataType: "json",
    success: function (data) {
      $.each(data, function (index, asset) {
        const row = $("<tr></tr>");
        const columns = [asset.asset_id, asset.name, asset.type];
        $.each(columns, function (index, columnData) {
          const cell = $("<td></td>").text(columnData);
          row.append(cell);
        });
        $("#table-content").append(row);
      });
    },
    error: function (xhr, status, error) {
      console.error("Error:", status, error);
    },
  });
}
