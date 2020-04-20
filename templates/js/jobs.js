var sortPrice = document.getElementById("sortPrice");
var sortDuration = document.getElementById("sortDuration");
var sortPostedDate = document.getElementById("sortPostedDate");
var postedByMe = document.getElementById("postedByMe");
var showMyJobs = document.getElementById("showMyJobs");
var sortReverse = document.getElementById("sortReverse");
var hideTaken = document.getElementById("hideTaken");
var jobNodes = document.getElementById("allJobs").children;

var currentUser = JSON.parse({{currentUser_|tojson}});
sortPostedDate.checked = true;
var buttons = ["sortPrice", "sortDuration", "sortPostedDate", "postedByMe", "showMyJobs", "sortReverse", "hideTaken"];


function revert () {
  for (var i = 0; i < buttons.length; i ++) { document.getElementById(buttons[i]).checked = false; }
  
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


function postedByMe_ () {
  // HIDE JOBS THAT ARE NOT POSTED BY USER
  if (postedByMe.checked) {
    var buttons_ = [];
    for (var i = 0; i < buttons.length; i ++) {
      if (buttons[i] != "postedByMe") {
        document.getElementById(buttons[i]).checked = false;
        buttons_.push(buttons[i]);
      }
    }
    toggleButtons(buttons_, "postedByMe");
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
}


function showMyJobs_ () {
  // SHOW ONLY USER'S JOBS
  if (showMyJobs.checked) {
    var buttons_ = [];
    for (var i = 0; i < buttons.length; i ++) {
      if (buttons[i] != "showMyJobs") {
        document.getElementById(buttons[i]).checked = false;
        buttons_.push(buttons[i]);
      }
    }
    toggleButtons(buttons_, "showMyJobs");
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
}


function hideTaken_ () {
  // HIDE JOBS THAT ARE TAKEN (NOT BY USER)
  if (hideTaken.checked) {
    var buttons_ = [];
    for (var i = 0; i < buttons.length; i ++) {
      if (buttons[i] != "hideTaken") {
        document.getElementById(buttons[i]).checked = false;
        buttons_.push(buttons[i]);
      }
    }
    toggleButtons(buttons_, "hideTaken");
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
}

function sortPrice_ () {
  // SORT BY PRICE
  if (sortPrice.checked) {
    var buttons_ = [];
    for (var i = 0; i < buttons.length; i ++) {
      if (buttons[i] != "sortPrice") {
        document.getElementById(buttons[i]).checked = false;
        buttons_.push(buttons[i]);
      }
    }
    toggleButtons(buttons_, "sortPrice");
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
    revert();
  }
}


function sortDuration_ () {
  // SORT BY DURATION
  if (sortDuration.checked) {
    var buttons_ = [];
    for (var i = 0; i < buttons.length; i ++) {
      if (buttons[i] != "sortDuration") {
        document.getElementById(buttons[i]).checked = false;
        buttons_.push(buttons[i]);
      }
    }
    toggleButtons(buttons_, "sortDuration");
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
    revert();
  }
}


function sortPostedDate_ () {
  // SORT BY DATE POSTED
  if (sortPostedDate.checked) {
    var buttons_ = [];
    for (var i = 0; i < buttons.length; i ++) {
      if (buttons[i] != "sortPostedDate") {
        document.getElementById(buttons[i]).checked = false;
        buttons_.push(buttons[i]);
      }
    }
    toggleButtons(buttons_, "sortPostedDate");
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
    revert();
  }
}

function sortReverse_ () {
  // REVERSE THE NODES
  var reversedData = [];
  for (var i = jobNodes.length - 1; i >=0; i --) {
    reversedData.push(jobNodes[i]);
  }
  document.getElementById("allJobs").innerHTML = "";
  for (var i = 0; i < reversedData.length; i ++) {
    document.getElementById("allJobs").appendChild(reversedData[i]);
  }
}


function toggleButtons (buttons_, button) {
  for (var i = 0; i < buttons_.length; i ++) {
    if (buttons_[i] == "sortPrice") { 
      document.getElementById(buttons_[i]).checked = false; sortPrice_(); 
    }
    else if (buttons_[i] == "sortDuration") { 
      document.getElementById(buttons_[i]).checked = false; sortDuration_(); 
    }
    else if (buttons_[i] == "sortPostedDate") { 
      document.getElementById(buttons_[i]).checked = false; sortPostedDate_(); 
    }
    else if (buttons_[i] == "postedByMe") { 
      document.getElementById(buttons_[i]).checked = false; postedByMe_(); 
    }
    else if (buttons_[i] == "showMyJobs") { 
      document.getElementById(buttons_[i]).checked = false; showMyJobs_(); 
    }
    else if (buttons_[i] == "sortReverse") { 
      document.getElementById(buttons_[i]).checked = false; sortReverse_(); 
    }
    else if (buttons_[i] == "hideTaken") { 
      document.getElementById(buttons_[i]).checked = false; hideTaken_(); 
    }
  }
  document.getElementById(button).checked = true;
}

postedByMe.onchange = function () { postedByMe_(); };

showMyJobs.onchange = function () {showMyJobs_(); };

hideTaken.onchange = function() { hideTaken_(); };

sortPrice.onchange = function () { sortPrice_(); };

sortDuration.onchange = function () { sortDuration_(); };

sortPostedDate.onchange = function () { sortPostedDate_(); };

sortReverse.onchange = function () { sortReverse_(); };
