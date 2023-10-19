checkLogin();
let PlacesService;
let backendURL = "https://weatherapp-085g.onrender.com";

// Get weatherApp cookies
const cookieValue = document.cookie
  .split("; ")
  .find((row) => row.startsWith("weatherAppCookie="))
  ?.split("=")[1];

function checkLogin() {
  loggedInCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("weatherappLogin="))
    ?.split("=")[1];

  if (loggedInCookie === undefined) {
    window.location.href = "./Login/loginPage.html";
  }
}

let newFavorite = `<div id="openweathermap-widget-17"></div>`;

// newFavorite.src = "https://via.placeholder.com/150";
// newFavorite.alt = "Favorite";
// newFavorite.classList.add("img-thumbnail");
// newFavorite.style.margin = "5px";

favoritesDiv.insertAdjacentHTML("beforeend", newFavorite);
let navButton = document.createElement("button");
navButton.classList.add("btn");
navButton.classList.add("btn-outline-warning");
navButton.type = "submit";
navButton.setAttribute("onclick", "logOff()");
navButton.textContent = "Log Off";
navBarButton.appendChild(navButton);

// Generate the list of previously searched zip codes
function previouslySearched() {
  let currentCookies = document.cookie
    .split("; ")
    .find((row) => row.startsWith("weatherAppCookie="))
    ?.split("=")[1];

  if (currentCookies !== undefined) {
    let previouslySearched = currentCookies.split(",");
    const previouslySearchedDiv = document.getElementById(
      "previouslySearchedDiv"
    );
    previouslySearchedDiv.replaceChildren();
    previouslySearchedDiv.appendChild(document.createElement("h6"));
    previouslySearchedDiv.lastChild.textContent = "Previous Searches:";
    for (let element of previouslySearched) {
      let newLocation = document.createElement("button");
      newLocation.classList.add("btn");
      // newLocation.style.border = "solid";
      newLocation.style.marginTop = "-10px";
      newLocation.style.marginRight = "-4px";
      newLocation.style.padding = "3px";
      newLocation.onclick = `${console.log("test")}`;
      newLocation.classList.add("text-decoration-underline");
      newLocation.classList.add("search-history");
      newLocation.value = element;
      newLocation.setAttribute("onclick", "getCurrentWeather()");
      newLocation.textContent = element;
      previouslySearchedDiv.appendChild(newLocation);
    }
  }
}

// event listener that checks the location search field
locationSearch.addEventListener("keypress", (e) => {
  let searchValue = document.getElementById("locationSearch");

  let newCookieList = document.cookie
    .split("; ")
    .find((row) => row.startsWith("weatherAppCookie="))
    ?.split("=")[1];

  if (e.key === "Enter") {
    const locationSearch = getLonAndLatFromLocalStorage();
    if (!newCookieList && locationSearch !== undefined) {
      document.cookie = `weatherAppCookie=${locationSearch.name}`;
    } else if (locationSearch !== undefined) {
      if (!newCookieList.includes(locationSearch.name)) {
        document.cookie = `weatherAppCookie=${locationSearch.name},${newCookieList}`;
      }
    }
    getCurrentWeather();
    getAirPollution();
    getWeatherAlerts();
    previouslySearched();
    let forecastTitle = document.getElementById("forecastTitle");
    forecastTitle.innerHTML = `${locationSearch.name} Forecast`;
  }
});

async function initPlaces() {
  PlacesService = await google.maps.importLibrary("places");

  const options = {
    componentRestrictions: { country: "us" },
    fields: ["address_components", "geometry", "icon", "name"],
  };

  const autocomplete = new PlacesService.Autocomplete(
    document.getElementById("locationSearch"),
    options
  );

  google.maps.event.addListener(autocomplete, "place_changed", () => {
    let place = autocomplete.getPlace();
    saveLonAndLatToLocalStorage({
      lat: place.geometry.location.lat(),
      lon: place.geometry.location.lng(),
      name: place.name,
    });
  });
}

function saveLonAndLatToLocalStorage({ lat, lon, name }) {
  localStorage.setItem("lat", lat);
  localStorage.setItem("lon", lon);
  localStorage.setItem("name", name);
}

// get lon and lat from local storage
function getLonAndLatFromLocalStorage() {
  const lat = localStorage.getItem("lat");
  const lon = localStorage.getItem("lon");
  const name = localStorage.getItem("name");

  return { lat, lon, name };
}

// get current weather (Only returns the current weather)
async function getCurrentWeather() {
  const { lat, lon, name } = await getLonAndLatFromLocalStorage();
  const response = await fetch(
    `${backendURL}/api/weatherapp/openweather?lat=${lat}&lon=${lon}`
  );
  const data = await response.json();
  createWeatherCard([data[0]]);
  let forecastTitle = document.getElementById("forecastTitle");
  forecastTitle.innerHTML = `${name} Forecast`;
}

// get air pollution
async function getAirPollution() {
  const { lat, lon } = await getLonAndLatFromLocalStorage();
  let airQualityDiv = document.getElementById("airQualityDiv");

  const response = await fetch(
    `${backendURL}/api/weatherapp/openweather/airpollution?lat=${lat}&lon=${lon}`
  );
  const data = await response.json();
  let qualityText = document.createElement("h2");
  let qualityTitle = document.createElement("h1");
  qualityText.classList.add("text-center");
  qualityText.textContent = `${data.airPollution}`;
  airQualityDiv.replaceChildren();
  airQualityDiv.appendChild(qualityTitle);
  qualityTitle.classList.add("text-center");
  qualityTitle.textContent = "Air Quality";
  airQualityDiv.appendChild(qualityText);
}

// create weather card
function createWeatherCard(content) {
  mainWeatherDiv.replaceChildren();
  for (let element of content) {
    let weatherCard = document.createElement("div");
    weatherCard.classList.add("card");
    weatherCard.style.width = "18rem";
    let weatherCardImg = document.createElement("img");
    weatherCardImg.classList.add("card-img-top");
    weatherCardImg.src = element.iconUrl;
    weatherCardImg.alt = "weather icon";
    weatherCard.appendChild(weatherCardImg);
    let mainWeatherDiv = document.getElementById("mainWeatherDiv");
    let weatherCardBody = document.createElement("div");
    weatherCardBody.classList.add("card-body");
    weatherCardBody.innerHTML = `
    <hr/>
    <p>Temp: ${element.temp}</p>
    <p>Wind Speed: ${element.windSpeed}</p>
    <p>Humidity: ${element.humidity}</p>
    `;
    weatherCard.appendChild(weatherCardBody);
    mainWeatherDiv.appendChild(weatherCard);
  }
}

async function getWeatherAlerts() {
  await fetch(`${backendURL}/api/weatherapp/nationalalerts?count=5`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      for (let element of data) {
        if (element.headline != null) {
          let newTableRow = document.createElement("tr");
          newTableRow.innerHTML = `
          <td>${element.alertType}</td>
          <td>${element.effective}</td>
          <td>${element.expires}</td>
  <td>${element.severity}</td>
          <td>${element.headline}</td>
          <td>${element.description}</td>
          `;
          alertTableBody.appendChild(newTableRow);
        }
      }
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}

async function getHourlyForecast() {
  const { lat, lon, name } = await getLonAndLatFromLocalStorage();
  const response = await fetch(
    `${backendURL}/api/weatherapp/openweather/forecast?lat=${lat}&lon=${lon}&count=5`
  );
  const data = await response.json();
  createWeatherCard(data);
  let forecastTitle = document.getElementById("forecastTitle");
  forecastTitle.innerHTML = `${name} Forecast`;
}

function logOff() {
  document.cookie =
    "weatherappLogin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.href = "./Login/loginPage.html";
}

// function pollutionChart(pollution) {
//   google.charts.load("current", { packages: ["bar"] });
//   google.charts.setOnLoadCallback(drawStuff);

//   function drawStuff() {
//     var data = new google.visualization.arrayToDataTable([
//       ["", "Percentage"],
//       ["co", 138.52],
//       ["np", 0],
//       ["no2", 0.31],
//       ["o3", 70.81],
//       ["so2", 0.09],
//       ["pm2_5", 10.44],
//       ["pm10", 31.2],
//       ["nh3", 0.58],
//     ]);

//     var options = {
//       title: "Air Pollution",
//       width: 900,
//       legend: { position: "none" },
//       chart: { title: "Air Pollution Chart" },
//       bars: "horizontal", // Required for Material Bar Charts.
//       axes: {
//         x: {
//           0: { side: "top", label: "" }, // Top x-axis.
//         },
//       },
//       bar: { groupWidth: "90%" },
//     };

//     var chart = new google.charts.Bar(document.getElementById("top_x_div"));
//     chart.draw(data, options);
//   }
// }

window.onload = previouslySearched();

window.onload = getWeatherAlerts();

window.onload = getCurrentWeather();
