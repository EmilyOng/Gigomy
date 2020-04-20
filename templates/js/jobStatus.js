var jobStatus = JSON.parse({{jobStatus_|tojson}});
for (var status in jobStatus) {
  if (jobStatus[status]) {
    if (status == "abandonedJob") {
      M.toast({html: "You have abandoned the job!"});
    }
    else if (status == "editedJob") {
      M.toast({html: "You have edited the job!"});
    }
    else if (status == "takenUpJob") {
      M.toast({html: "You have taken up the job!"});
    }
    else if (status == "deletedJob") {
      M.toast({html: "You have deleted the job!"});
    }
  }
}
