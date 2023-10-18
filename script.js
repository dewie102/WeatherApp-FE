// Get weatherApp cookies
const cookieValue = document.cookie
  .split("; ")
  .find((row) => row.startsWith("weatherAppCookie="))
  ?.split("=")[1];

// Generate the list of previously searched zip codes
let previouslySearched = function previouslySearched() {
  let previouslySearched = cookieValue.split(",");

  const previouslySearchedDiv = document.getElementById(
    "previouslySearchedDiv"
  );
  previouslySearchedDiv.replaceChildren();
  previouslySearchedDiv.appendChild(document.createElement("h6"));
  previouslySearchedDiv.lastChild.textContent = "Previous Searches:";
  for (let element of previouslySearched) {
    let newLocation = document.createElement("a");
    newLocation.classList.add("text-decoration-none");
    newLocation.classList.add("search-history");
    newLocation.value = element;
    newLocation.onclick = function () {
      // TODO: make a call to the function that gets the new location from the weather api
    };
    newLocation.textContent = element;
    previouslySearchedDiv.appendChild(newLocation);
  }
};

// event listener that checks the location search field
locationSearch.addEventListener("keypress", (e) => {
  let searchValue = document.getElementById("locationSearch").value;

  if (e.key === "Enter") {
    if (!cookieValue) {
      console.log(cookieValue);
      document.cookie = `weatherAppCookie=${searchValue}`;
    } else {
      console.log(cookieValue);

      document.cookie = `weatherAppCookie=${searchValue},${cookieValue}`;
    }
    previouslySearched;
  }
});

window.onload = previouslySearched;
