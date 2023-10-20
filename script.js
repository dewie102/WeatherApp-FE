checkLogin();
let chart;
let PlacesService;
let backendURL = "https://weatherapp-085g.onrender.com";
// let backendURL = "http://localhost:3000";

function checkLogin() {
    let loggedInCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("weatherappLogin="))
        ?.split("=")[1];

    if (loggedInCookie === undefined) {
        window.location.href = "./Login/loginPage.html";
    }
    let navButton = document.createElement("button");
    navButton.classList.add("btn");
    navButton.classList.add("btn-outline-warning");
    navButton.type = "submit";
    navButton.setAttribute("onclick", "logOff()");
    navButton.textContent = "Log Off";
    navBarButton.appendChild(navButton);
}

// Get weatherApp cookies
const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith("weatherAppCookie="))
    ?.split("=")[1];

// get a photo for each favorite
async function getLocationPhoto(location, htmlLocation) {
    await fetch(`${backendURL}/api/weatherapp/photo?location=${location}`)
        .then((response) => response.json())
        .then((content) => {
            htmlLocation.src = content.url;
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

// get favorite
async function getFavorites() {
    let userCookie = JSON.parse(
        document.cookie
            .split("; ")
            .find((row) => row.startsWith("weatherappLogin="))
            ?.split("=")[1]
    );

    await fetch(
        `${backendURL}/api/weatherapp/getfavorites?id=${userCookie.user.id}&token=${userCookie.token}`
    )
        .then((response) => response.json())
        .then((content) => {
            if (Object.hasOwn(content, "error")) {
                return alert(`Failed to get the user's favorites`);
            }
            const favoriteList = content.favorites;

            for (let element of favoriteList) {
                renderFavorites(element);
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function renderFavorites(element) {
    let mainFavoriteDiv = document.getElementById("favoritesDiv");

    fetch(
        `${backendURL}/api/weatherapp/openweather?lat=${element.lat}&lon=${element.lon}`
    )
        .then((response) => response.json())
        .then((content) => {
            let newLocation = content[0];

            let newFavorite = document.createElement("div");
            newFavorite.style.marginRight = "10px";
            newFavorite.classList.add("card");
            newFavorite.style.width = "12rem";
            newFavorite.style.height = "20rem";
            let newFavoriteImg = document.createElement("img");
            newFavoriteImg.style.width = "12rem";
            newFavoriteImg.style.height = "10rem";

            newFavoriteImg.classList.add("card-img-top");
            newFavoriteImg.src = getLocationPhoto(
                element.locationName,
                newFavoriteImg
            );
            newFavoriteImg.alt = "Favorite";
            let innerFavoriteDiv = document.createElement("div");
            innerFavoriteDiv.classList.add("card-body");
            let favoriteTitle = document.createElement("h5");
            favoriteTitle.classList.add("card-title");
            favoriteTitle.textContent = element.locationName;
            let locationTemp = document.createElement("p");
            locationTemp.classList.add("card-text");
            locationTemp.textContent = "Temp: " + newLocation.temp + "°F";
            let locationWind = document.createElement("p");
            locationWind.classList.add("card-text");
            locationWind.textContent = "Wind: " + newLocation.windSpeed + "°F";
            let locationHumidity = document.createElement("p");
            locationHumidity.classList.add("card-text");
            locationHumidity.textContent =
                "Humidity: " + newLocation.humidity + "°F";

            newFavorite.appendChild(newFavoriteImg);
            newFavorite.appendChild(innerFavoriteDiv);
            innerFavoriteDiv.appendChild(favoriteTitle);
            innerFavoriteDiv.appendChild(locationTemp);
            innerFavoriteDiv.appendChild(locationWind);
            innerFavoriteDiv.appendChild(locationHumidity);
            mainFavoriteDiv.appendChild(newFavorite);
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

// Generate the list of previously searched zip codes
function previouslySearched() {
    let currentCookies = document.cookie
        .split("; ")
        .find((row) => row.startsWith("weatherAppCookie="))
        ?.split("=")[1];

    if (currentCookies !== undefined) {
        let formattedString = `[${currentCookies}]`;
        let previouslySearched = JSON.parse(formattedString);
        const previouslySearchedDiv = document.getElementById(
            "previouslySearchedDiv"
        );
        previouslySearchedDiv.replaceChildren();
        previouslySearchedDiv.appendChild(document.createElement("h6"));
        previouslySearchedDiv.lastChild.textContent = "Previous Searches:";
        for (let element of previouslySearched) {
            let newLocation = document.createElement("button");
            newLocation.classList.add("btn");
            newLocation.style.marginTop = "-10px";
            newLocation.style.marginRight = "-4px";
            newLocation.style.padding = "3px";
            newLocation.classList.add("text-decoration-underline");
            newLocation.classList.add("search-history");
            newLocation.value = `[{"name": "${element.name}", "lat": "${element.lat}", "lon": "${element.lon}"}]`;
            newLocation.setAttribute(
                `onclick`,
                `searchPreviousOption(this.value)`
            );
            newLocation.textContent = element.name;
            previouslySearchedDiv.appendChild(newLocation);
        }
    }
}

function searchPreviousOption(value) {
    let jsonValue = JSON.parse(value);
    saveLonAndLatToLocalStorage({
        lat: jsonValue[0].lat,
        lon: jsonValue[0].lon,
        name: jsonValue[0].name,
    });
    getCurrentWeather();
    getAirPollution();
    getWeatherAlerts();
    previouslySearched();
}

// event listener that checks the location search field
locationSearch.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        search();
    }
});

// contains the code used when the user types in the search bar and presses enter
function search() {
    let newCookieList = document.cookie
        .split("; ")
        .find((row) => row.startsWith("weatherAppCookie="))
        ?.split("=")[1];

    const locationSearch = getLonAndLatFromLocalStorage();

    if (!newCookieList && locationSearch !== undefined) {
        document.cookie = `weatherAppCookie={"name": "${locationSearch.name}", "lat": "${locationSearch.lat}", "lon": "${locationSearch.lon}"}`;
    } else if (locationSearch !== undefined) {
        if (!newCookieList.includes(locationSearch.name)) {
            document.cookie = `weatherAppCookie={"name": "${locationSearch.name}", "lat": "${locationSearch.lat}", "lon": "${locationSearch.lon}"},${newCookieList}`;
        }
    }
    getCurrentWeather();
    getAirPollution();
    getWeatherAlerts();
    previouslySearched();
    let forecastTitle = document.getElementById("forecastTitle");
    forecastTitle.innerHTML = `${locationSearch.name} Forecast`;
}

// initialize places autocomplete
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

        search();
    });
}

// save lon and lat to local storage
function saveLonAndLatToLocalStorage({ lat, lon, name }) {
    localStorage.setItem("lat", lat);
    localStorage.setItem("lon", lon);
    localStorage.setItem("name", name);
}

// get lon and lat from local storage
function getLonAndLatFromLocalStorage() {
    let lat = localStorage.getItem("lat");
    let lon = localStorage.getItem("lon");
    let name = localStorage.getItem("name");

    if (!lat || !lon) {
        lat = "40.7128";
        lon = "-74.0060";
        name = "New York";
    }

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

    drawPollutionChart(data);
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

// get weather alerts
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
            console.error(
                "There was a problem with the fetch operation:",
                error
            );
        });
}

// get hourly forecast
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

// log of
function logOff() {
    document.cookie =
        "weatherappLogin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "./Login/loginPage.html";
}

// save favorite
async function saveFavorite() {
    let userCookie = JSON.parse(
        document.cookie
            .split("; ")
            .find((row) => row.startsWith("weatherappLogin="))
            ?.split("=")[1]
    );

    const { lat, lon, name } = await getLonAndLatFromLocalStorage();

    let favoriteData = {
        id: userCookie.user.id,
        token: userCookie.token,
        name: name,
        lat: lat,
        lon: lon,
    };
    await fetch(`${backendURL}/api/weatherapp/updatefavorites`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(favoriteData),
    })
        .then((response) => response.json())
        .then((content) => {
            if (Object.hasOwn(content, "error")) {
                return alert(
                    `Failed to add ${name} to favorites. ${content.error}`
                );
            }
            alert(`Successfully added ${name} to favorites!`);
            renderFavorites(content);
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function drawPollutionChart(data) {
    const ctx = document.getElementById("chart_canvas");

    const labels = Object.keys(data).filter((e) => e !== "airPollution");
    const values = Object.values(data).slice(0, -1);

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Pollutant concentration in μg/m3",
                    data: values,
                    borderWidth: 1,
                },
            ],
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true,
                },
            },
            indexAxis: "y",
        },
    });
}

window.onload = previouslySearched();
window.onload = getWeatherAlerts();
window.onload = getCurrentWeather();
window.onload = getFavorites();
window.onload = getAirPollution();
