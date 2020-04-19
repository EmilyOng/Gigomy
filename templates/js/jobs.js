var sortPrice = document.getElementById("sortPrice");
var sortDuration = document.getElementById("sortDuration");
var sortPostedDate = document.getElementById("sortPostedDate");
var postedByMe = document.getElementById("postedByMe");
var showMyJobs = document.getElementById("showMyJobs");
var sortReverse = document.getElementById("sortReverse");
var hideTaken = document.getElementById("hideTaken");
var jobNodes = document.getElementById("allJobs").children;

hideTaken.checked = true;
sortPostedDate.checked = true;

var currentUser = JSON.parse({{currentUser_|tojson}});

var buttons = [sortPrice, sortDuration, sortPostedDate, postedByMe, showMyJobs, sortReverse, hideTaken];

postedByMe.onchange = function () {
  // HIDE JOBS THAT ARE NOT POSTED BY USER
  if (postedByMe.checked) {
    for (var i = 0; i < jobNodes.length; i ++) {
      if (jobNodes[i].getAttribute("data-item-sender") != currentUser["username"]) {
        jobNodes[i].setAttribute("data-item-hidden", "true")
        jobNodes[i].style.display = "none";
      }
    }
  }
  else {
    // UNHIDE JOBS
    for (var i = 0; i < jobNodes.length; i ++) {
      if (jobNodes[i].getAttribute("data-item-sender") != currentUser["username"]) {
        jobNodes[i].style.display = "block";
        jobNodes[i].setAttribute("data-item-hidden", "false");
      }
    }
  }
};

showMyJobs.onchange = function () {
  // SHOW ONLY USER'S JOBS
  if (showMyJobs.checked) {
    for (var i = 0; i < jobNodes.length; i ++) {
      if (jobNodes[i].getAttribute("data-item-receiver") != currentUser["username"]) {
        jobNodes[i].setAttribute("data-item-hidden", "true")
        jobNodes[i].style.display = "none";
      }
    }
  }
  else {
    // UNHIDE JOBS
    for (var i = 0; i < jobNodes.length; i ++) {
      if (jobNodes[i].getAttribute("data-item-receiver") != currentUser["username"]) {
        jobNodes[i].style.display = "block";
        jobNodes[i].setAttribute("data-item-hidden", "false");
      }
    }
  }
};

hideTaken.onchange = function() {
  // HIDE JOBS THAT ARE TAKEN (NOT BY USER)
  if (hideTaken.checked) {
    for (var i = 0; i < jobNodes.length; i ++) {
      if (jobNodes[i].getAttribute("data-item-receiver") != "None" &&
          jobNodes[i].getAttribute("data-item-receiver") != currentUser["username"]) {
        jobNodes[i].setAttribute("data-item-hidden", "true")
        jobNodes[i].style.display = "none";
      }
    }
  }
  else {
    // UNHIDE JOBS
    for (var i = 0; i < jobNodes.length; i ++) {
      if (jobNodes[i].getAttribute("data-item-receiver") != "None" &&
          jobNodes[i].getAttribute("data-item-receiver") != currentUser["username"]) {
        jobNodes[i].style.display = "block";
        jobNodes[i].setAttribute("data-item-hidden", "false");
      }
    }
  }
};

sortPrice.onchange = function () {
  // SORT BY PRICE
  if (sortPrice.checked) {
    // Uncheck other fields except for hideTaken
    for (var i = 0; i < buttons.length - 1; i ++) {
      if (buttons[i] != sortPrice) {
        buttons[i].checked = false;
      }
    }
    var sortedData = [];
    function comparator (a, b) {
      return b["price"] - a["price"];
    }
    for (var i = 0; i < jobNodes.length; i ++) {
      var price_ = jobNodes[i].getAttribute("data-item-price");
      price_ = price_.split("$");
      var price = parseFloat(price_[1]);
      sortedData.push({"data": jobNodes[i], "price": price});
    }
    sortedData.sort(comparator);
    document.getElementById("allJobs").innerHTML = "";
    for (var i = 0; i < sortedData.length; i ++) {
      document.getElementById("allJobs").appendChild(sortedData[i]["data"]);
    }
  }
  else {
    // Revert to original
    sortPostedDate.checked = true;
  }
};

sortDuration.onchange = function () {
  // SORT BY DURATION
  if (sortDuration.checked) {
    // Uncheck other fields except for hideTaken
    for (var i = 0; i < buttons.length - 1; i ++) {
      if (buttons[i] != sortDuration) {
        buttons[i].checked = false;
      }
    }
    var sortedData = [];
    var duration;
    function comparator (a, b) {
      return a["duration"] - b["duration"]
    }
    for (var i = 0; i < jobNodes.length; i ++) {
      var duration = parseInt(jobNodes[i].getAttribute("data-item-duration"));
      sortedData.push({"data": jobNodes[i], "duration": duration});
    }
    sortedData.sort(comparator);
    document.getElementById("allJobs").innerHTML = "";
    for (var i = 0; i < sortedData.length; i ++) {
      document.getElementById("allJobs").appendChild(sortedData[i]["data"]);
    }
  }
  else {
    sortPostedDate.checked = true;
  }
};

sortPostedDate.onchange = function () {
  // SORT BY DATE POSTED
  if (sortPostedDate.checked) {
    // Uncheck other fields except for hideTaken
    for (var i = 0; i < buttons.length - 1; i ++) {
      if (buttons[i] != sortPostedDate) {
        buttons[i].checked = false;
      }
    }
    var sortedData = [];
    function comparator (a, b) {
      return b["datePosted"] - a["datePosted"];
    }
    for (var i = 0; i < jobNodes.length; i ++) {
      var datePosted = new Date(jobNodes[i].getAttribute("data-item-datePosted"));
      sortedData.push({"data": jobNodes[i], "datePosted": datePosted});
    }
    sortedData.sort(comparator);
    document.getElementById("allJobs").innerHTML = "";
    for (var i = 0; i < sortedData.length; i ++) {
      document.getElementById("allJobs").appendChild(sortedData[i]["data"]);
    }
  }
  else {
    sortPostedDate.checked = true;
  }
};

sortReverse.onchange = function () {
  // REVERSE THE NODES
  var reversedData = [];
  for (var i = jobNodes.length - 1; i >=0; i --) {
    reversedData.push(jobNodes[i]);
  }
  document.getElementById("allJobs").innerHTML = "";
  for (var i = 0; i < reversedData.length; i ++) {
    document.getElementById("allJobs").appendChild(reversedData[i]);
  }
};
