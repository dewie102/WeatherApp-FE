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
    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        if (response.status === 200) {
          // Authentication was successful
          window.location.href = "index.html";
        } else {
          // Authentication failed
          alert(
            "Login failed. Please check your username and password. If you do not have an account please create one."
          );
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
