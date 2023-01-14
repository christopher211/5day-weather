const API_KEY = "070f884be9b7cb792ff556300c39e43d";
const API_ENDPOINT = "http://api.openweathermap.org/";
const WEATHER_ICON = "http://openweathermap.org/img/wn/";

$(document).ready(function () {
  let latitude = 0;
  let longitude = 0;

  let currDTValue = "";
  const fiveDaysOfWeather = [];

  const getSearchCityWeather = () => {
    $("#searchBtn").on("click", () => {
      const cityName = $("#inputCity").val();
      getCityLocationApi(cityName);
    });
  };

  const getCityLocationApi = (city) => {
    const endpoint = `${API_ENDPOINT}geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;

    fetch(endpoint)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log("getCityLocationApi", data);
        latitude = data[0].lat;
        longitude = data[0].lon;
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
    data.forEach((obj) => {
      // use moment or dayjs to parse the obj dt variable and get the "real date"
      const dateObj = moment.unix(obj.dt);

      // from this dateObj, use moment or js to get the date it represents. ***This is for you to do ***.
      const currDay = dateObj.format("MM/DD/YYYY");

      // if the current dt value differs from the global variable, AND we don't have data in our array for this day,
      // we must be on a new day
      if (
        currDay !== currDTValue &&
        fiveDaysOfWeather.length <= 6 &&
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
    fiveDaysOfWeather.forEach((d) => {});
  };

  // Convert Kelvin to Fahrenheit
  const convertKToF = (kelvin) => {
    return Math.ceil(1.8 * (kelvin - 273) + 32);
  };

  const showHideDeleteIcon = (str) => {
    const storageKeys = Object.keys(localStorage);
    if (storageKeys.includes(str)) {
      return "";
    } else {
      return "hidden";
    }
  };

  // Create time block content element depend on business hours
  // businessHoursArr.forEach((h) => {
  //   // Time block
  //   $("<div/>", {
  //     id: `hour-${h}`,
  //     class: `row time-block ${getTime(h)}`,
  //   }).appendTo("#time-block-container");

  //   // Create business hour text
  //   $("<div/>", {
  //     id: `text-center-${h}`,
  //     class: "col-2 col-md-1 hour text-center py-3",
  //   }).appendTo(`#hour-${h}`);

  //   $("<p/>", {
  //     text: `${h}:00`,
  //   }).appendTo(`#text-center-${h}`);

  //   // Create delete icon
  //   $("<i/>", {
  //     class: `delete-icon fas fa-trash ${showHideDeleteIcon(`hour-${h}`)}`,
  //     click: () => {
  //       clearSpecificWorkPlan(`hour-${h}`);
  //     },
  //   })
  //     .attr("aria-hidden", "true")
  //     .appendTo(`#text-center-${h}`);

  //   // Create textarea
  //   $("<textarea/>", {
  //     class: "col-8 col-md-10 description",
  //   })
  //     .attr("rows", "3")
  //     .appendTo(`#hour-${h}`);

  //   // Create save button
  //   $("<button/>", {
  //     id: `saveBtn-${h}`,
  //     class: "btn saveBtn col-2 col-md-1",
  //   })
  //     .attr("aria-label", "save")
  //     .appendTo(`#hour-${h}`);

  //   // Create save icon
  //   $("<i/>", {
  //     class: "fas fa-save",
  //   })
  //     .attr("aria-hidden", "true")
  //     .appendTo(`#saveBtn-${h}`);
  // });

  // $("<button/>", {
  //   id: `clearBtn`,
  //   class: "btn btn-danger",
  //   text: "Clear all",
  //   click: (e) => {
  //     clearAllWorkPlans(e);
  //   },
  // }).appendTo(`.btn-container`);

  const saveWorkPlanData = () => {
    // Get all button elements by class
    const saveBtns = $(".saveBtn");
    // Add a click event listener to each save button
    saveBtns.on("click", function (e) {
      // The `this` keyword refers to the element that was clicked
      const saveBtns = $(this);
      // Find the time-block element that contains the save button
      const timeBlock = saveBtns.closest(".time-block");
      // Get the id of the time-block element (e.g. "hour-9")
      const id = timeBlock.attr("id");
      // Get the value of the description input field
      const description = timeBlock.find(".description").val();
      console.log(description.length);
      if (description.length === 0 || description === "") {
        alert("There is no data to save!");
        return;
      }
      // Save the description in local storage with key is id
      localStorage.setItem(id, JSON.stringify(description));
      // Show delete icon after add data
      $(`#${id} .text-center .delete-icon`).removeClass("hidden");
    });
  };

  // Get work plan data from local storage
  const retrieveWorkPlanData = () => {
    $(".time-block").each(function () {
      let id = $(this).attr("id");
      let data = localStorage.getItem(id);
      if (data) {
        $(this).find(".description").val(JSON.parse(data));
      }
    });
  };

  const clearSpecificWorkPlan = (key) => {
    // Show a browser alert to confirm user action
    const confirm = window.confirm("Are you sure to clear this data?");

    if (confirm) {
      // Clear local storage by key
      localStorage.removeItem(key);
      // Clear text in textarea description
      $(`#${key} .description`).val("");
      // Hide delete icon
      $(`#${key} .text-center .delete-icon`).addClass("hidden");
    }
  };

  // Clear all the work plan in local storage
  const clearAllWorkPlans = (e) => {
    // Check if local storage has data
    if (localStorage.length === 0) {
      window.alert("There is no data!");
      return;
    }

    // Show a browser alert to confirm user action
    const confirm = window.confirm("Are you sure to clear all data?");

    if (confirm) {
      // Clear all storage
      localStorage.clear();
      // Clear text in textarea description
      $(".time-block .description").val("");
      // Hide delete icon
      $(`.time-block .text-center .delete-icon`).addClass("hidden");
    }
  };

  saveWorkPlanData();
  retrieveWorkPlanData();
  getSearchCityWeather();
});
