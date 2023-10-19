const URL_BASE = "https://weatherapp-085g.onrender.com";
const API_BASE = "api/weatherapp";

// JavaScript event listener for the login form
document
  .getElementById("login-form")
  .addEventListener("submit", function (event) {
    // Prevent default
    event.preventDefault();

    // Pull the fields from the form
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    // fetch to check if the user exist in the database
    // if the user exist redirect the user if the user does not
    // exist alert the user with minimal information
    // TODO: update this area with the DB information
    fetch(`${URL_BASE}/${API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((content) => {
        if (Object.hasOwn(content, "error")) {
          return alert(content.error);
        }

        console.log(content);
        document.cookie = `weatherappLogin=${JSON.stringify(content)};path=/`;
        console.log(document.cookie);
      })
      .then(() => {
        window.location.href = "../index.html";
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
