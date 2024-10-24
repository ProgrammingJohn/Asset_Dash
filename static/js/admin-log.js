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
  type = ""
) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "/api/get/log",
      method: "GET",
      dataType: "json",
      success: function (data) {
        filtered_assets = [];
        data.forEach((asset) => {
          if (
            asset["asset_id"].toLowerCase().startsWith(asset_id) &&
            asset["user_id"].toLowerCase().startsWith(user_id) &&
            asset["type"].toLowerCase().startsWith(type) &&
            asset["first_name"].toLowerCase().startsWith(first_name) &&
            asset["last_name"].toLowerCase().startsWith(last_name) &&
            asset["name"].toLowerCase().startsWith(name)
          ) {
            filtered_assets.push(asset);
          }
        });
        resolve(filtered_assets);
      },
      error: function (xhr, status, error) {
        console.error("Error:", status, error);
        reject(status);
      },
    });
  });
}

async function onFilterUser() {
  let user_id = $("#searchid").val();
  let first_name = $("#searchfirstname").val();
  let last_name = $("#searchlastname").val();
  user_id = user_id != undefined ? user_id : "";
  first_name = first_name != undefined ? first_name : "";
  last_name = last_name != undefined ? last_name : "";

  console.log(`${user_id},${first_name},${last_name}`);

  let filtered_user_data = await fetchUserData(user_id, first_name, last_name);
  updateUserTable(filtered_user_data);
}

function createSearchRow() {
  console.log("new");
  adminTableSearch.empty();
  let row = $(`<tr>`);
  let idInput = $(
    `<td><input id="searchid" type="text" onInput="onFilterUser()"/></td>`
  );
  let firstNameInput = $(
    `<td><input id="searchfirstname" type="text" onInput="onFilterUser()"/></td>`
  );
  let lastNameInput = $(
    `<td><input id="searchlastname" type="text" onInput="onFilterUser()"/></td>`
  );
  row.append(idInput, firstNameInput, lastNameInput);
  row.append("</tr>");
  adminTableSearch.append(row);
}

function updateAssetTable(data) {
  adminTableBody.empty();
  // asset_id = "",
  // user_id = "",
  // first_name = "",
  // last_name = "",
  // name = "",
  // type = ""
  adminTableBody.append(
    "<tr><td>Asset Id</td><td>User Id</td><td>First Name</td><td>Last Name</td><td>Name</td><td>Type</td></tr>"
  );

  $.each(data, function (index, transaction) {
    const row = $(`<tr id="${transaction.asset_id}row"></tr>`);
    const idInput = $(
      `<td><input id="${transaction.asset_id}id" type="number" value="${transaction.asset_id}"/></td>`
    );
    const nameInput = $(
      `<td><input id="${transaction.user_id}userid" type="text" value="${transaction.user_id}"/></td>`
    );
    row.append(
      $(
        `<td><input id="${transaction.first_name}firstname" type="text" value="${transaction.first_name}"/></td>`
      )
    );
    row.append(
      $(
        `<td><input id="${transaction.first_name}firstname" type="text" value="${transaction.first_name}"/></td>`
      )
    );
    row.append(idInput, nameInput, typeInput);
    adminTableBody.append(row);
  });
}

$(document).ready(async function () {
  tableSection = $("#table-section");
  adminTableBody = $("#admin-table-body");
  adminTableSearch = $("#admin-table-search");

  data = await fetchLogData();
  console.log(data);

  updateAssetTable(data);
});
