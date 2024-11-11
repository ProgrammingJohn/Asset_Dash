$(document).ready(function () {
  var user = null;
  var inputBuffer = "";
  var users = [];
  var currentUser = null;
  var isAssetScanning = false;
  var userTimeout = null;
  var logoutDelay = 60000;
  var infoUpdateDelay = 30000;
  $("#prompt").text("Type Name or Scan Asset:");
  
  function getUsersList() {
    $.ajax({
      url: "/api/get/users/all",
      method: "GET",
      dataType: "json",
      success: function (data) {
        users = data;
      },
      error: function (xhr, status, error) {
        console.error("Error:", status, error);
      },
    });
  }

  getUsersList();
  updateTable();

  setInterval(() => {
      getUsersList();
      updateTable();
  }, infoUpdateDelay);

  function updateTable() {
    $("#table-content").empty();
    $.ajax({
      url: "/api/get/assets/out",
      method: "GET",
      dataType: "json",
      success: function (data) {
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
          $("#table-content").append(row);
        });
      },
      error: function (xhr, status, error) {
        console.error("Error:", status, error);
      },
    });
  }

  function checkOutAsset(user, assetId) {
    $.ajax({
      url: "/api/post/assets/check-out",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ user_id: user.user_id, asset_id: assetId }),
      success: function (response) {
        notify(response, "success");
        updateTable();
      },
      error: function (xhr, status, error) {
        notify(xhr.responseText, "error");
      },
    });
  }

  function checkInAsset(assetId) {
    $.ajax({
      url: "/api/post/assets/check-in",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ asset_id: assetId }),
      success: function (response) {
        notify(response, "success");
        updateTable();
      },
      error: function (xhr, status, error) {
        notify(xhr.responseText, "error");
      },
    });
  }

  function notify(text, status) {
    var notifications = $("#notifications");
    var notification = $("<div>")
      .addClass("notification")
      .addClass(status)
      .text(text);
    notifications.append(notification);
    notification.fadeIn().delay(3000).fadeOut(400);
  }

  function findMatches(buffer) {
    let matches = [];
    for (user of users) {
      fullName =
        user.first_name.toLowerCase() + " " + user.last_name.toLowerCase();
      if (fullName.startsWith(buffer)) {
        matches.push(user);
      }
    }
    return matches;
  }

  function logoutCurrentUser() {
    notify(
      `${currentUser.first_name} ${currentUser.last_name} has been logged out`,
      "error"
    );
    currentUser = null;
    $("#prompt").text("Type Your Name or Scan Asset:");
    $("#currentUserName").text("");
    inputBuffer = "";
  }

  $(document).on("keydown", function (event) {
    console.log("ping"+event.key);
    if (event.key == "~" || event.key == "*") {
      console.log(event.key, inputBuffer);
      inputBuffer += event.key;
      if (inputBuffer == "*~*") {
        inputBuffer = "";
        isAssetScanning = true;
        console.log("valid scan");
      }
    }
    if (isAssetScanning && event.key >= "0" && event.key <= "9") {
      inputBuffer += event.key;
      $("#input").val(inputBuffer);
    }
    if (isAssetScanning && event.key == "Enter") {
      console.log(inputBuffer);
      if (currentUser) {
        checkOutAsset(currentUser, inputBuffer);
        clearTimeout(userTimeout);
        userTimeout = setTimeout(logoutCurrentUser, logoutDelay);
      } else {
        checkInAsset(inputBuffer);
      }
      inputBuffer = "";
      isAssetScanning = false;
      $("#input").val("");
    }
    if (event.key == "Escape" && currentUser) {
      logoutCurrentUser();
      clearTimeout(userTimeout);
    }
    if (!currentUser) {
      if (
        event.key == "Backspace" ||
        (event.key.length === 1 &&
          (event.key.match(/[a-z]/i) || event.key == " "))
      ) {
        if (event.key == " ") {
          inputBuffer += " ";
        } else if (event.key == "Backspace") {
          inputBuffer = inputBuffer.substring(0, inputBuffer.length - 1);
        } else {
          inputBuffer += event.key.toLowerCase();
        }
        let matches = [];
        if (inputBuffer.length > 0) {
          matches = findMatches(inputBuffer);
        }
        $("#matchesList").empty();

        if (matches.length == 1) {
          currentUser = matches[0];
          fullName = currentUser.first_name + " " + currentUser.last_name;
          $("#currentUserName").text(fullName);
          $("#prompt").text("Scan Asset:");
          notify(
            `Welcome ${fullName}! \n Press Escape for new user`,
            "success"
          );
          userTimeout = setTimeout(logoutCurrentUser, logoutDelay);
          inputBuffer = "";
          $("#input").val("");
          return;
        }
        if (matches.length > 0) {
          $("#input").val(inputBuffer);
          matchesList = $("#matchesList");
          $.each(matches, function (index, user) {
            userEntry = $("<li>").text(user.first_name + " " + user.last_name);
            matchesList.append(userEntry);
          });
          return;
        }
        $("#input")
          .css("background-color", "var(--red)")
          .animate({ "background-color": "white" }, 500);
        inputBuffer = "";
        $("#input").val(inputBuffer);
      }
    }
    event.preventDefault();
  });
});
