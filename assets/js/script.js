const API_KEY = "070f884be9b7cb792ff556300c39e43d";
const API_ENDPOINT = "http://api.openweathermap.org/";
const WEATHER_ICON = "http://openweathermap.org/img/wn/";

$(document).ready(function () {
  let latitude = 0;
  let longitude = 0;
  let currDTValue = "";
  const fiveDaysOfWeather = [];
  let savedSearches = JSON.parse(localStorage.getItem("saved_searches")) || [];

  const getSearchCityWeather = () => {
    $("#searchBtn").on("click", () => {
      const cityName = $("#inputCity").val();
      if (cityName !== "") {
        getWeatherApi(cityName);
      }
    });
  };

  const getWeatherApi = (city) => {
    const endpoint = `${API_ENDPOINT}geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;

    fetch(endpoint)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log("getCityLocationApi", data);
        latitude = data[0].lat;
        longitude = data[0].lon;
        const savedData = {
          lat: latitude,
          lng: longitude,
          city,
        };

        const exists =
          savedSearches.findIndex(
            (s) => s.city.toLowerCase() === savedData.city.toLowerCase()
          ) > -1;

        if (!exists) {
          savedSearches.push(savedData);
        }

        localStorage.setItem("saved_searches", JSON.stringify(savedSearches));
        showSearchHistory();

        getCityCurrentWeatherByLatLng(latitude, longitude);
        getCity5DayWeatherByLatLng(latitude, longitude);
      });
  };

  const getCityCurrentWeatherByLatLng = (lat, lng) => {
    const endpoint = `${API_ENDPOINT}data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}`;

    fetch(endpoint)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log("getCityCurrentWeatherByLatLng", data);
        const currentCity = data.name;
        const currentDate = moment.unix(data.dt).format("MM/DD/YYYY");
        const currentWeatherIcon = `${WEATHER_ICON}${data.weather[0].icon}@2x.png`;
        const fahrenheit = convertKToF(data.main.temp);
        const wind = data.wind.speed;
        const humidity = data.main.humidity;

        $("#currentCity").text(`City: ${currentCity} `);
        $("#currentDay").text(` (${currentDate})`);
        $("#weatherIcon").empty();
        $("<img />", {
          class: "weather-icon",
        })
          .attr("src", currentWeatherIcon)
          .appendTo(`#weatherIcon`);

        $("#currentTemp").text(`Temp: ${fahrenheit} F`);
        $("#currentWind").text(`Wind: ${wind}`);
        $("#currentHumidity").text(`Humidity: ${humidity}`);
      });
  };

  const getCity5DayWeatherByLatLng = (lat, lng) => {
    const endpoint = `${API_ENDPOINT}data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${API_KEY}`;

    fetch(endpoint)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log("getCityWeatherByLatLng", data);
        parseWeatherData(data.list);
      });
  };

  const parseWeatherData = (data) => {
    fiveDaysOfWeather.length = 0;
    data.forEach((obj) => {
      // use moment or dayjs to parse the obj dt variable and get the "real date"
      const dateObj = moment.unix(obj.dt);

      // from this dateObj, use moment or js to get the date it represents. ***This is for you to do ***.
      const currDay = dateObj.format("MM/DD/YYYY");

      // if the current dt value differs from the global variable, AND we don't have data in our array for this day,
      // we must be on a new day
      if (
        currDay !== currDTValue &&
        fiveDaysOfWeather.length < 5 &&
        !fiveDaysOfWeather.find((day) => day.dt === obj.dt)
      ) {
        // update the global variable so we don't use this day again
        currDTValue = currDay;

        // if JS is still in this function, then we must be encountering this dt object for the first time. So the obj variable used in the forEach() must be referring to the firt hour block for this day. get the first record (the obj variable above) and use that for the weather for this day
        fiveDaysOfWeather.push(obj);
      }
    });

    // Once the code gets here, we should have one weather object per day.
    console.log(fiveDaysOfWeather);
    parse5DayForecastHTML(fiveDaysOfWeather);
  };

  // Convert Kelvin to Fahrenheit
  const convertKToF = (kelvin) => {
    return Math.ceil(1.8 * (kelvin - 273) + 32);
  };

  // Create dynamic 5-day forecast html
  const parse5DayForecastHTML = (data) => {
    $("#fiveDayForecast").empty();
    data.forEach((d, index) => {
      const currentDate = moment.unix(d.dt).format("MM/DD/YYYY");
      const currentWeatherIcon = `${WEATHER_ICON}${d.weather[0].icon}@2x.png`;
      const fahrenheit = convertKToF(d.main.temp);
      const wind = d.wind.speed;
      const humidity = d.main.humidity;

      $("<div/>", {
        id: `card-${index}`,
        class: `card col-lg col-md-3 col-sm-6`,
      }).appendTo("#fiveDayForecast");

      $("<div/>", {
        id: `card-body-${index}`,
        class: "card-body custom-card-body",
      }).appendTo(`#card-${index}`);

      $("<div/>", {
        id: `card-title-${index}`,
        class: `card-title fw-bold`,
      }).appendTo(`#card-body-${index}`);

      $("<p/>", {
        class: ``,
        text: `${currentDate}`,
      }).appendTo(`#card-title-${index}`);

      $("<p/>", {
        id: `weatherIcon-${index}`,
        class: ``,
      }).appendTo(`#card-title-${index}`);

      $("<img />", {
        class: "weather-icon",
      })
        .attr("src", currentWeatherIcon)
        .appendTo(`#weatherIcon-${index}`);

      $("<p/>", {
        class: `card-text`,
        text: `Temp: ${fahrenheit}`,
      }).appendTo(`#card-body-${index}`);

      $("<p/>", {
        class: `card-text`,
        text: `Wind: ${wind}`,
      }).appendTo(`#card-body-${index}`);

      $("<p/>", {
        class: `card-text`,
        text: `Humidity: ${humidity}`,
      }).appendTo(`#card-body-${index}`);
    });
  };

  // Display search history
  const showSearchHistory = () => {
    const savedSearchesElem = $("#savedSearched");
    savedSearchesElem.empty();

    savedSearches.forEach((s) => {
      savedSearchesElem.append(
        $("<div/>", { class: "mb-1" }).append(
          $("<button/>", {
            class: "btn btn-secondary w-100",
            text: `${s.city}`,
            click: (e) => {
              const { lat, lng } = e.target.dataset;
              getCityCurrentWeatherByLatLng(lat, lng);
              getCity5DayWeatherByLatLng(lat, lng);
            },
          })
            .attr("data-lat", s.lat)
            .attr("data-lng", s.lng)
        )
      );
    });
  };

  showSearchHistory();
  getSearchCityWeather();
});
