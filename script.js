let PlacesService;

// Get weatherApp cookies
const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith("weatherAppCookie="))
    ?.split("=")[1];

let isLoggedIn = true;

// TODO: if logged in get and display the favorites and place them in the favoritesDiv div
if (isLoggedIn) {
    for (let i = 0; i < 5; i++) {
        let newFavorite = document.createElement("img");
        newFavorite.src = "https://via.placeholder.com/150";
        newFavorite.alt = "Favorite";
        newFavorite.classList.add("img-thumbnail");
        newFavorite.style.margin = "5px";
        favoritesDiv.appendChild(newFavorite);
    }
}
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
    console.log("test");
    let searchValue = document.getElementById("locationSearch");

    if (e.key === "Enter") {
        const locationSearch = getLocationFromZip(searchValue.value);
        if (!cookieValue && locationSearch !== undefined) {
            document.cookie = `weatherAppCookie=${searchValue.value}`;
        } else if (locationSearch !== undefined) {
            if (!cookieValue.includes(searchValue.value)) {
                document.cookie = `weatherAppCookie=${searchValue.value},${cookieValue}`;
            }
        }
        getCurrentWeather();
        getAirPollution();
    }
});

// get location from zipcode
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

// process the returned location value
function processReturnedLocationValue(locationValue) {
    if (Object.hasOwn(locationValue, "error")) {
        alert(locationValue.error);
        return;
    }

    console.log(locationValue);
    if (!locationValue.lat && !locationValue.lon) {
        console.log("Something went wrong, we don't have both values");
        return;
    }

    saveLonAndLatToLocalStorage({
        lat: locationValue.lat,
        lon: locationValue.lon,
    });
}

// save lon and lat to local storage
function saveLonAndLatToLocalStorage({ lat, lon }) {
    localStorage.setItem("lat", lat);
    localStorage.setItem("lon", lon);
}

// get lon and lat from local storage
function getLonAndLatFromLocalStorage() {
    const lat = localStorage.getItem("lat");
    const lon = localStorage.getItem("lon");

    return { lat, lon };
}

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
        console.log(place);
        console.log(place.geometry.location);
        console.log(place.geometry.location.lat());
        console.log(place.geometry.location.lng());
    });
}

// get current weather (Only returns the current weather)
async function getCurrentWeather() {
    const { lat, lon } = await getLonAndLatFromLocalStorage();

    const response = await fetch(
        `http://localhost:3000/api/weatherapp/openweather?lat=${lat}&lon=${lon}`
    );
    const data = await response.json();
    createWeatherCard(data);
}

// get air pollution
async function getAirPollution() {
    const { lat, lon } = await getLonAndLatFromLocalStorage();
    let airQualityDiv = document.getElementById("airQualityDiv");

    const response = await fetch(
        `http://localhost:3000/api/weatherapp/openweather/airpollution?lat=${lat}&lon=${lon}`
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
    let weatherCard = document.createElement("div");
    weatherCard.classList.add("card");
    weatherCard.style.width = "18rem";
    let weatherCardImg = document.createElement("img");
    weatherCardImg.classList.add("card-img-top");
    weatherCardImg.src = content.iconUrl;
    weatherCardImg.alt = "weather icon";
    weatherCard.appendChild(weatherCardImg);
    let mainWeatherDiv = document.getElementById("mainWeatherDiv");
    mainWeatherDiv.replaceChildren();

    let weatherCardBody = document.createElement("div");
    weatherCardBody.classList.add("card-body");
    weatherCardBody.innerHTML = `
  <hr/>
  <p>Temp: ${content.temp}</p>
  <p>Wind Speed: ${content.windSpeed}</p>
  <p>Humidity: ${content.humidity}</p>
  `;
    weatherCard.appendChild(weatherCardBody);
    mainWeatherDiv.appendChild(weatherCard);
}

(function getWeatherAlerts() {
    // https://api.weather.gov/alerts/active
    fetch("https://api.weather.gov/alerts/active")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            console.log(data.features);
        })
        .catch((error) => {
            console.error(
                "There was a problem with the fetch operation:",
                error
            );
        });
})();

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

window.onload = previouslySearched;
