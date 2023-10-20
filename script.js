checkLogin();
let PlacesService;
let backendURL = "https://weatherapp-085g.onrender.com";
// let backend = "http://localhost:3000";

function checkLogin() {
    let loggedInCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("weatherappLogin="))
        ?.split("=")[1];

    if (loggedInCookie === undefined) {
        window.location.href = "./Login/loginPage.html";
    }
}

// Get weatherApp cookies
const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith("weatherAppCookie="))
    ?.split("=")[1];

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
            console.log(favoriteList);

            for (let element of favoriteList) {
                renderFavorites(element);

                //         <div class="card" style="width: 18rem;">
                //   <img class="card-img-top" src="..." alt="Card image cap">
                //   <div class="card-body">
                //     <h5 class="card-title">Card title</h5>
                //     <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                //     <a href="#" class="btn btn-primary">Go somewhere</a>
                //   </div>
                // </div>
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}
console.log(getFavorites());

function renderFavorites(element) {
    let mainFavoriteDiv = document.getElementById("favoritesDiv");
    console.log(element.lat);

    fetch(
        `${backendURL}/api/weatherapp/openweather?lat=${element.lat}&lon=${element.lon}`
    )
        .then((response) => response.json())
        .then((content) => {
            console.log(content);
        })
        .catch((error) => {
            console.error("Error:", error);
        });

    // let newFavorite = document.createElement("div");
    // newFavorite.classList.add("card");
    // newFavorite.style.width = "12rem";
    // newFavorite.style.height = "20rem";
    // let newFavoriteImg = document.createElement("img");
    // newFavoriteImg.style.width = "12rem";
    // newFavoriteImg.style.height = "10rem";

    // newFavoriteImg.classList.add("card-img-top");
    // newFavoriteImg.src = "https://placehold.jp/25x25.png";
    // newFavoriteImg.alt = "Favorite";
    // let innerFavoriteDiv = document.createElement("div");
    // innerFavoriteDiv.classList.add("card-body");
    // let favoriteTitle = document.createElement("h5");
    // favoriteTitle.classList.add("card-title");
    // favoriteTitle.textContent = element.locationName;
    // let locationWeather = document.createElement("p");
    // locationWeather.classList.add("card-text");
    // locationWeather.textContent = "Temp: " + element.temperature + "°F";

    // newFavorite.appendChild(newFavoriteImg);
    // newFavorite.appendChild(innerFavoriteDiv);
    // innerFavoriteDiv.appendChild(favoriteTitle);
    // innerFavoriteDiv.appendChild(locationWeather);
    // mainFavoriteDiv.appendChild(newFavorite);
}
// let newFavorite = document.createElement("img");
// newFavorite.src = "https://via.placeholder.com/150";
// newFavorite.alt = "Favorite";
// newFavorite.classList.add("img-thumbnail");
// newFavorite.style.margin = "5px";
// newFavorite.style.width = "150px";
// newFavorite.style.height = "150px";
// document.getElementById("favoritesDiv").appendChild(newFavorite);

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
            renderFavorites();
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

window.onload = previouslySearched();
window.onload = getWeatherAlerts();
window.onload = getCurrentWeather();

function drawPollutionChart(data) {
    const ctx = document.getElementById("chart_canvas");

    const labels = Object.keys(data).filter((e) => e !== "airPollution");
    const values = Object.values(data).slice(0, -1);

    new Chart(ctx, {
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
