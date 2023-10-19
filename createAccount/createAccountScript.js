const signupForm = document.getElementById("signup-form");

signupForm.addEventListener("submit", function (event) {
  event.preventDefault();
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  var confirmPassword = document.getElementById("confirmPassword").value;

  if (password === confirmPassword) {
    // Gather data and create the object that will be passed to the backend
    var user = {
      username: username,
      password: password,
    };

    // Create and send the create request to the backend as a POST method
    //TODO: update this area with the DB information and the api information
    fetch("/createAccount", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    })
      .then((response) => {
        if (response.status === 200) {
          alert("Account created successfully!");
          // If the login is successful, redirect to the login page so they can login
          window.location.href = "login.html";
        } else {
          alert("Account creation failed. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  } else {
    alert(
      "Passwords do not match. Please try again. The password should be between 8 and 15 characters"
    );
  }
});
