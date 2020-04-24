var request =  new XMLHttpRequest();
var jobs = document.getElementById("jobs");

function addJob (data) {
  var HTML = '<div class="col s12 m7">\
                <div class="card horizontal">\
                  <div class="card-stacked">\
                    <div class="card-content">\
                      <span class="card-title">\
                        <span class="badge">JOB_SENDER</span>\
                        JOB_TITLE\
                      </span>\
                      <p>JOB_DESCRIPTION</p>\
                      <p><strong>Date start:</strong> JOB_DATESTART</p>\
                      <p><strong>Date end:</strong> JOB_DATEND</p>\
                      <p><strong>Duration:</strong> JOB_DURATION</p>\
                      <span class="badge">SGDJOB_PRICE</span>\
                      <span class="badge">\
                        <i class="material-icons tiny">location_on</i>\
                        JOB_LOCATION\
                      </span>\
                    </div>\
                    <div class="card-action">\
                      <a href=JOB_LINK target="_blank">Find out more</a>\
                    </div>\
                  </div>\
                </div>\
              </div>';

  jobLINK = "https://gigomy--emilyong.repl.co/see/" + data["jobID"].toString();
  var newHTML = HTML.replace("JOB_TITLE", data["jobTitle"])
                    .replace("JOB_DESCRIPTION", data["jobDescription"])
                    .replace("JOB_SENDER", data["jobSender"])
                    .replace("JOB_DATESTART", data["jobDateStart"])
                    .replace("JOB_DATEND", data["jobDateEnd"])
                    .replace("JOB_DURATION", data["jobDuration"])
                    .replace("JOB_PRICE", data["jobPrice"])
                    .replace("JOB_LOCATION", data["jobLocation"])
                    .replace("JOB_LINK", jobLINK);

  jobs.innerHTML += newHTML;
}

request.open("GET", "https://gigomy--emilyong.repl.co/api/getJobs");
request.send();

request.onload = () => {
  if (request.status === 200) {
    result = JSON.parse(request.response);
    if (result.length == 0) {
      jobs.innerHTML = "There are no available jobs now!";
    }
    else {
      jobs.innerHTML = "";
      for (var i = 0; i < result.length; i ++) {
        addJob(result[i]);
      }
    }
  }
}
