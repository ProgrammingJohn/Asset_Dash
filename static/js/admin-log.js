let adminTableSearch, adminTableBody, activeTableView;

function notify(text, status) {
  const notifications = $("#notifications");
  let notification = $("<div>")
    .addClass("notification")
    .addClass(status)
    .text(text);
  notifications.append(notification);
  notification.fadeIn().delay(3000).fadeOut(400);
}

function fetchLogData(
  asset_id = "",
  user_id = "",
  first_name = "",
  last_name = "",
  name = "",
  type = "",
  time_checked = ""
) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "/api/get/log",
      method: "GET",
      dataType: "json",
      success: function (data) {
        let filtered_assets = [];
        data.forEach((asset) => {
          console.log(asset);

          if (
            asset["asset_id"].toLowerCase().startsWith(asset_id) &&
            asset["user_id"].toLowerCase().startsWith(user_id) &&
            asset["type"].toLowerCase().startsWith(type) &&
            asset["first_name"].toLowerCase().startsWith(first_name) &&
            asset["last_name"].toLowerCase().startsWith(last_name) &&
            asset["name"].toLowerCase().startsWith(name) &&
            asset["time_checked"].toLowerCase().startsWith(time_checked)
          ) {
            filtered_assets.push(asset);
          }
        });
        resolve(filtered_assets.reverse());
      },
      error: function (xhr, status, error) {
        console.error("Error:", status, error);
        reject(status);
      },
    });
  });
}

async function onFilterUser() {
  let type = $("#searchtype").val();
  let first_name = $("#searchfirstname").val();
  let last_name = $("#searchlastname").val();
  let user_id = $("#searchuserid").val();
  let name = $("#searchname").val();
  let asset_id = $("#searchassetid").val();
  let time_checked = $("#searchtimechecked").val();

  // Set default empty values if undefined
  type = type !== undefined ? type : "";
  first_name = first_name !== undefined ? first_name : "";
  last_name = last_name !== undefined ? last_name : "";
  user_id = user_id !== undefined ? user_id : "";
  name = name !== undefined ? name : "";
  asset_id = asset_id !== undefined ? asset_id : "";
  time_checked = time_checked !== undefined ? time_checked : "";

  console.log(
    `${type}, ${first_name}, ${last_name}, ${user_id}, ${name}, ${asset_id}, ${time_checked}`
  );

  // Pass all search values to fetchUserData
  let filtered_user_data = await fetchLogData(
    asset_id,
    user_id,
    first_name,
    last_name,
    name,
    type,
    time_checked
  );
  updateLogTable(filtered_user_data);
}

function createSearchRow() {
  console.log("new");
  adminTableSearch.empty();

  let row = $("<tr>");

  let typeInput = $(
    `<td><input id="searchtype" type="text" onInput="onFilterUser()"/></td>`
  );
  let firstNameInput = $(
    `<td><input id="searchfirstname" type="text" onInput="onFilterUser()"/></td>`
  );
  let lastNameInput = $(
    `<td><input id="searchlastname" type="text" onInput="onFilterUser()"/></td>`
  );
  let userIdInput = $(
    `<td><input id="searchuserid" type="text" onInput="onFilterUser()"/></td>`
  );
  let nameInput = $(
    `<td><input id="searchname" type="text" onInput="onFilterUser()"/></td>`
  );
  let assetIdInput = $(
    `<td><input id="searchassetid" type="text" onInput="onFilterUser()"/></td>`
  );
  let timeCheckedInput = $(
    `<td><input id="searchtimechecked" type="text" onInput="onFilterUser()"/></td>`
  );

  // Append all input elements to the row
  row.append(
    typeInput,
    firstNameInput,
    lastNameInput,
    userIdInput,
    nameInput,
    assetIdInput,
    timeCheckedInput
  );

  row.append("</tr>");
  adminTableSearch.append(row);
}

function updateLogTable(data) {
  adminLogBody.empty();
  adminLogBody.append(
    "<tr><td>Type</td><td>First Name</td><td>Last Name</td><td>User Id</td><td>Name</td><td>Asset Id</td><td>Time Checked</td></tr>"
  );

  $.each(data, function (index, transaction) {
    const row = $(`<tr id="${index}row"></tr>`);
    const transactionType = $(
      `<td class="${
        transaction.type == "out" ? "out" : "in"
      }" id="${index}type"/>${transaction.type}</td>`
    );
    const transactionFirstName = $(
      `<td id="${index}firstName"/>${transaction.first_name}</td>`
    );
    const transactionLastName = $(
      `<td id="${index}lastName"/>${transaction.last_name}</td>`
    );
    const transactionUserId = $(
      `<td id="${index}userId"/>${transaction.user_id}</td>`
    );
    const transactionAssetName = $(
      `<td id="${index}assetName"/>${transaction.name}</td>`
    );
    const transactionAssetId = $(
      `<td id="${index}assetId"/>${transaction.asset_id}</td>`
    );
    const transactionTimeChecked = $(
      `<td id="${index}timeChecked"/>${transaction.time_checked}</td>`
    );
    row.append(
      transactionType,
      transactionFirstName,
      transactionLastName,
      transactionUserId,
      transactionAssetName,
      transactionAssetId,
      transactionTimeChecked
    );
    adminLogBody.append(row);
  });
}

$(document).ready(async function () {
  tableSection = $("#table-section");
  adminLogBody = $("#admin-table-body");
  adminTableSearch = $("#admin-table-search");

  createSearchRow();
  data = await fetchLogData();
  console.log(data);

  updateLogTable(data);
});
