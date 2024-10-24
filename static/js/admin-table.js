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

function fetchAssetData(id = "", name = "", type = "") {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "/api/get/assets/all",
      method: "GET",
      dataType: "json",
      success: function (data) {
        filtered_assets = [];
        data.forEach((asset) => {
          if (
            asset["asset_id"].toLowerCase().startsWith(id) &&
            asset["name"].toLowerCase().startsWith(name) &&
            asset["type"].toLowerCase().startsWith(type)
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

function fetchUserData(user_id = "", first_name = "", last_name = "") {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "/api/get/users/all",
      method: "GET",
      dataType: "json",
      success: function (data) {
        let filtered_users = [];
        data.forEach((user) => {
          console.log(user);
          console.log(
            user["user_id"].toString().toLowerCase().startsWith(user_id),
            user["first_name"].toLowerCase().startsWith(first_name),
            user["last_name"].toLowerCase().startsWith(last_name)
          );
          if (
            user["user_id"].toString().toLowerCase().startsWith(user_id) &&
            user["first_name"].toLowerCase().startsWith(first_name) &&
            user["last_name"].toLowerCase().startsWith(last_name)
          ) {
            filtered_users.push(user);
          }
        });
        console.log(filtered_users);
        resolve(filtered_users);
      },
      error: function (xhr, status, error) {
        console.error("Error:", status, error);
        reject(status);
      },
    });
  });
}

async function onTableViewToggle() {
  if (activeTableView == "Assets") {
    fetchAndUpdateUsers();
    createUserSearchRow();
    $("#table-name").text("Users");
    $(`#table-view-toggle`).text(`View ${activeTableView} Table`);
    activeTableView = "Users";
  } else if (activeTableView == "Users") {
    fetchAndUpdateAssets();
    createAssetSearchRow();
    $("#table-name").text("Assets");
    $(`#table-view-toggle`).text(`View ${activeTableView} Table`);
    activeTableView = "Assets";
  }
}

function addUser() {
  userFirstName = $(`#addfirstname`).val();
  userLastName = $(`#addlastname`).val();

  $.ajax({
    url: "/api/post/users/add",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      user_first_name: userFirstName,
      user_last_name: userLastName,
    }),
    success: function (response) {
      notify(response, "success");
      fetchAndUpdateUsers();
    },
    error: function (xhr, status, error) {
      notify(xhr.responseText, "error");
    },
  });
}

function addAsset() {
  assetId = $(`#addid`).val();
  assetName = $(`#addname`).val();
  assetType = $(`#addtype`).val();
  $.ajax({
    url: "/api/post/assets/add",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      asset_id: assetId,
      asset_name: assetName,
      asset_type: assetType,
    }),
    success: function (response) {
      notify(response, "success");
      fetchAndUpdateAssets();
    },
    error: function (xhr, status, error) {
      notify(xhr.responseText, "error");
    },
  });
}

function deleteUser(id) {
  $.ajax({
    url: "/api/post/users/delete",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({ user_id: id }),
    success: function (response) {
      fetchAndUpdateUsers();
      notify(response, "success");
    },
    error: function (xhr, status, error) {
      notify(xhr.responseText, "error");
    },
  });
}

function deleteAsset(id) {
  $.ajax({
    url: "/api/post/assets/delete",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({ asset_id: id }),
    success: function (response) {
      fetchAndUpdateAssets();
      notify(response, "success");
    },
    error: function (xhr, status, error) {
      notify(xhr.responseText, "error");
    },
  });
}

function editUser(id) {
  editedFirstName = $(`#${id}firstname`).val();
  editedLastName = $(`#${id}lastname`).val();
  $.ajax({
    url: "/api/post/users/edit",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      user_id: id,
      edited_first_name: editedFirstName,
      edited_last_name: editedLastName,
    }),
    success: function (response) {
      notify(response, "success");
      fetchAndUpdateUsers();
    },
    error: function (xhr, status, error) {
      notify(xhr.responseText, "error");
    },
  });
}

function editAsset(id) {
  editedId = $(`#${id}id`).val();
  editedName = $(`#${id}name`).val();
  editedType = $(`#${id}type`).val();
  $.ajax({
    url: "/api/post/assets/edit",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      asset_id: id,
      edited_id: editedId,
      edited_name: editedName,
      edited_type: editedType,
    }),
    success: function (response) {
      notify(response, "success");
      fetchAndUpdateAssets();
    },
    error: function (xhr, status, error) {
      notify(xhr.responseText, "error");
    },
  });
}

async function onFilterAsset() {
  let asset_id = $("#searchid").val();
  let name = $("#searchname").val();
  let type = $("#searchtype").val();
  asset_id = asset_id != undefined ? asset_id : "";
  name = name != undefined ? name : "";
  type = type != undefined ? type : "";

  console.log(`${asset_id},${name},${type}`);

  let filtered_asset_data = await fetchAssetData(asset_id, name, type);
  updateAssetTable(filtered_asset_data);
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

function createUserSearchRow() {
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

function updateUserTable(data) {
  adminTableBody.empty();
  adminTableBody.append(
    "<tr><td>Id</td><td>First Name</td><td>Last Name</td><td>Action</td></tr>"
  );

  row = $(`<tr id="addrow"></tr>`);
  firstNameInput = $(`<td><input id="addfirstname" type="text"/></td>`);
  lastNameInput = $(`<td><input id="addlastname" type="text"/></td>`);
  action = $(
    `<td>
      <input id='adduser' type='button' value='add' onclick='addUser()'/>
    </td>`
  );
  row.append("<td></td>", firstNameInput, lastNameInput, action);
  adminTableBody.append(row);

  $.each(data, function (index, user) {
    let row = $(`<tr id="${user.user_id}row"></tr>`);
    let userId = $(`<td>${user.user_id}</td>`);
    let firstNameInput = $(
      `<td><input id="${user.user_id}firstname" type="text" value="${user.first_name}"/></td>`
    );
    let lastNameInput = $(
      `<td><input id="${user.user_id}lastname" type="text" value="${user.last_name}"/></td>`
    );
    let action = $(
      `<td>
        <input id="${user.user_id}delete" type="button" value="delete" onclick="deleteUser(${user.user_id})"/>
        <input id="${user.user_id}edit" type="button" value="edit" onclick="editUser(${user.user_id})"/>
      </td>`
    );
    row.append(userId, firstNameInput, lastNameInput, action);
    adminTableBody.append(row);
  });
}

function createAssetSearchRow() {
  adminTableSearch.empty();
  let row = $(`<tr>`);
  let idInput = $(
    `<td><input id="searchid" type="text" onInput="onFilterAsset()"/></td>`
  );
  let nameInput = $(
    `<td><input id="searchname" type="text" onInput="onFilterAsset()"/></td>`
  );
  let typeInput = $(
    `<td><input id="searchtype" type="text" onInput="onFilterAsset()"/></td>`
  );

  row.append(idInput, nameInput, typeInput);
  row.append("</tr>");
  adminTableSearch.append(row);
}

function updateAssetTable(data) {
  adminTableBody.empty();

  adminTableBody.append(
    "<tr><td>Id</td><td>Asset Name</td><td>Asset Type</td><td>Action</td></tr>"
  );

  // add new asset row
  row = $(`<tr id="addrow"></tr>`);
  idInput = $(`<td><input id="addid" type="number"/></td>`);
  nameInput = $(`<td><input id="addname" type="text"/></td>`);
  typeInput = $(`<td><input id="addtype" type="text"/></td>`);
  action = $(
    `<td>
      <input id="addadd" type="button" value="add" onclick="addAsset()"/>
    </td>`
  );
  row.append(idInput, nameInput, typeInput, action);
  adminTableBody.append(row);

  $.each(data, function (index, asset) {
    const row = $(`<tr id="${asset.asset_id}row"></tr>`);
    const idInput = $(
      `<td><input id="${asset.asset_id}id" type="number" value="${asset.asset_id}"/></td>`
    );
    const nameInput = $(
      `<td><input id="${asset.asset_id}name" type="text" value="${asset.name}"/></td>`
    );
    const typeInput = $(
      `<td><input id="${asset.asset_id}type" type="text" value="${asset.type}"/></td>`
    );
    const action = $(
      `<td>
        <input id="${asset.asset_id}delete" type="button" value="delete" onclick="deleteAsset(${asset.asset_id})"/>
        <input id="${asset.asset_id}edit" type="button" value="edit" onclick="editAsset(${asset.asset_id})"/>
      </td>`
    );
    row.append(idInput, nameInput, typeInput, action);
    adminTableBody.append(row);
  });
}

async function fetchAndUpdateUsers() {
  userData = await fetchUserData();
  updateUserTable(userData);
  onFilterUser();
  $("html, body").animate({ scrollTop: 0 }, "fast");
}

async function fetchAndUpdateAssets() {
  assetData = await fetchAssetData();
  updateAssetTable(assetData);
  onFilterAsset();
  $("html, body").animate({ scrollTop: 0 }, "fast");
}

$(document).ready(async function () {
  tableSection = $("#table-section");
  adminTableBody = $("#admin-table-body");
  adminTableSearch = $("#admin-table-search");

  activeTableView = "Assets";
  if (activeTableView == "Assets") {
    createAssetSearchRow();
    fetchAndUpdateAssets();
  } else if (activeTableView == "Users") {
    createUserSearchRow();
    fetchAndUpdateUsers();
  }
});
