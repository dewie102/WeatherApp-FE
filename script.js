// Generate the list of previously searched zip codes
(function previouslySearched() {
  // Change the previouslySearched array to a cookie read to get the list of searched locations
  const previouslySearched = [78840, 78840, 78840, 78840, 78840, 78840, 78840];

  const previouslySearchedDiv = document.getElementById(
    "previouslySearchedDiv"
  );

  for (let element of previouslySearched) {
    let newLocation = document.createElement("a");
    newLocation.classList.add("text-decoration-none");
    newLocation.classList.add("search-history");
    newLocation.href = "";
    newLocation.textContent = element;
    previouslySearchedDiv.appendChild(newLocation);
  }
})();

// event listener that checks the location search field
locationSearch.addEventListener("keypress", (e) => {
  let searchValue = document.getElementById("locationSearch").value;

  if (e.key === "Enter") {
    console.log(searchValue);
  }
});

// function that gets the weatherAppCookie
function getWeatherAppCookie() {
  document.cookie = "weatherAppCookie=99999";
  // document.cookie = "weatherAppCookie=";

  // get cookie list
  let weatherAppCookie = document.cookie
    .split(";")
    .find((row) => row.startsWith("weatherAppCookie="))
    ?.split("=")[1];

  return weatherAppCookie;
}
