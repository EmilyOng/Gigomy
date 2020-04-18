document.getElementById("loginButton").onclick = function () {
  var loginForm = document.getElementById("loginForm");
  var signupForm = document.getElementById("signupForm");
  signupForm.style.display = "none";
  if (loginForm.style.display == "none") {
    loginForm.style.display = "block";
  }
  else {
    loginForm.style.display = "none";
  }
};
document.getElementById("signupButton").onclick = function () {
  var signupForm = document.getElementById("signupForm");
  var loginForm = document.getElementById("loginForm");
  loginForm.style.display = "none";
  if (signupForm.style.display == "none") {
    signupForm.style.display = "block";
  }
  else {
    signupForm.style.display = "none";
  }
};
