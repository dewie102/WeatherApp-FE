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

      getLocationFromZip(searchValue);
    }
    previouslySearched;
  }
});

window.onload = previouslySearched;

function getLocationFromZip(zipcode) {
  try {
    fetch(
      `http://localhost:3000/api/weatherapp/openweather/zip?zipcode=${zipcode}`
    )
      .then((res) => res.json())
      .then((content) => {
        if (Object.hasOwn(content, "error")) {
          console.log(content.error);
          return content;
        }

        return content;
      })
      .then(processReturnedLocationValue);
  } catch (error) {
    console.log(error);
  }
}

function processReturnedLocationValue(locationValue) {
  if (Object.hasOwn(locationValue, "error")) {
    alert(locationValue.error);
    return;
  }

  if (!locationValue.lat && !locationValue.lon) {
    console.log("Something went wrong, we don't have both values");
    return;
  }

  saveLonAndLatToLocalStorage({
    lat: locationValue.lat,
    lon: locationValue.lon,
  });
}

function saveLonAndLatToLocalStorage({ lat, lon }) {
  localStorage.setItem("lat", lat);
  localStorage.setItem("lon", lon);
}

function getLonAndLatFromLocalStorage() {
  const lat = localStorage.getItem("lat");
  const lon = localStorage.getItem("lon");

  return { lat, lon };
}
