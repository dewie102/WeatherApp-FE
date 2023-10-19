const URL_BASE = "https://weatherapp-085g.onrender.com";
const API_BASE = "api/weatherapp";

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
    fetch(`${URL_BASE}/${API_BASE}/createuser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    })
      .then((response) => response.json())
      .then((content) => {
        if (Object.hasOwn(content, "error")) {
          return alert("Account creation failed. Please try again.");
        }

        alert("Account created successfully!");
        console.log(content);
        // If the login is successful, redirect to the login page so they can login
        window.location.href = "../Login/loginPage.html";
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
