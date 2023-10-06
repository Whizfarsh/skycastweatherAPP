'use strict';

let cityName,
  cityCountryCode,
  cityLat,
  cityLong,
  countryFlag,
  selectedLatAndlong;

let cityInput = document.getElementById('citysearch');
const scSearchResults = document.querySelector('.SC-search-results');
const scSearchResult = document.querySelector('.SC-search-result');
const SCHourlyDetails = document.querySelector('.SC-hourly-details');
const SCCurrentWeather = document.querySelector('.SC-current-weather');
const SCWeatherDate = document.querySelector('.SC-weather-date');
const SCWeatherLocation = document.querySelector('.SC-weather-location');
const SCDetails = document.querySelector('.SC--details');
const SCDailyForecasts = document.querySelector('.SC--daily-forecasts');
const SCOtherWeathers = document.querySelector('.SC-other--weathers');
const backgroundSection = document.querySelector('.skycastmain-body');
// console.log((backgroundSection.style.backgroundImage = "url('weathers/cloudy.jpg')";

//FUNCTIONS
// **FUNCTION FOR THE WEATHER **
const weatherAPP = async function (lats, longs) {
  try {
    let dateRange = [];
    let tempRange = [];
    let cloudRange = [];
    let humidityRange = [];
    let windSpeedRange = [];
    const weatherFatch = await fetch(
      `https://api.open-meteo.com/v1/gfs?latitude=${lats}&longitude=${longs}&hourly=temperature_2m,relativehumidity_2m,cloudcover,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,windspeed_10m_max&current_weather=true&windspeed_unit=mph&timezone=auto`
    );
    const weatherData = await weatherFatch.json();
    console.log(weatherData);
    const currentWeatherTime = weatherData.current_weather.time;
    const currentWeatherTemp = Math.round(
      weatherData.current_weather.temperature
    );
    let timeNow = currentWeatherTime.split('T');
    timeNow = timeNow[1];
    const tempData = weatherData.hourly.temperature_2m;
    const timeData = weatherData.hourly.time;
    const himidityData = weatherData.hourly.relativehumidity_2m;
    const cloudData = weatherData.hourly.cloudcover;
    const windspeedData = weatherData.hourly.windspeed_10m;

    // updating the current weather status
    //
    const getLocation = await fetch(
      `https://geocode.xyz/${lats},${longs}?geoit=json`
    );
    const getLocationData = await getLocation.json();
    SCWeatherLocation.textContent = getLocationData.city;
    SCWeatherLocation.style.fontSize = '2.4rem';

    SCCurrentWeather.textContent = `${currentWeatherTemp}°`;
    // --for the date
    const date = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const locale = 'en-US';

    const dateNow = new Intl.DateTimeFormat(locale, options).format(date);
    SCWeatherDate.textContent = dateNow;

    //looping through and creating new array for time and temperature
    let dateRanges = [];
    dateRanges.push(currentWeatherTime);
    timeData.forEach((theTime, i) => {
      if (theTime >= currentWeatherTime) {
        dateRanges.push(theTime);
        tempRange.push(tempData[i]);
        cloudRange.push(cloudData[i]);
        humidityRange.push(himidityData[i]);
        windSpeedRange.push(windspeedData[i]);
      }
    });
    tempRange = tempRange.splice(0, 24);
    dateRange = [...new Set(dateRanges)].splice(0, 24);
    cloudRange = cloudRange.splice(0, 24);
    humidityRange = humidityRange.splice(0, 24);
    windSpeedRange = windSpeedRange.splice(0, 24);
    dateRange.forEach((datesandtime, i) => {
      const onlyTime = datesandtime.split('T');
      if (timeNow === onlyTime[1]) {
        onlyTime[1] = 'Now';

        // insert weather inormations like cloudcover, wind speed, humidity
        const weatherInfoHtml = `
      <p class="SC-details"><span>${cloudConditionCategory(
        cloudRange[i]
      )}</span> ${cloudRange[i]}${weatherData.hourly_units.cloudcover}</p>
                <p class="SC-details"><span>Humidity</span> ${
                  humidityRange[i]
                }${weatherData.hourly_units.relativehumidity_2m}</p>
                <p class="SC-details"><span>WindSpeed</span> ${
                  windSpeedRange[i]
                }${weatherData.hourly_units.windspeed_10m}</p>
      `;
        SCDetails.insertAdjacentHTML('beforebegin', weatherInfoHtml);
      }
      const hourlyHtml = `
      <div class="SC-hourly--TDI">
                      <span>${onlyTime[1]}</span>
                      <span>${Math.round(tempRange[i])}°c</span>
                      <span
                        ><img
                          src="${classifytemps(tempRange[i])}"
                          class="SC--hourly-weather-icon"
                          alt=""
                      /></span>
                    </div>
      `;
      SCHourlyDetails.insertAdjacentHTML('beforeend', hourlyHtml);
    });

    //for daily forecasts
    const dailyDate = weatherData.daily.time;
    const dailyTempMinArray = weatherData.daily.temperature_2m_min;
    const dailyTempMaxArray = weatherData.daily.temperature_2m_max;
    const dailyWindSpeedMaxArray = weatherData.daily.windspeed_10m_max;
    dailyDate.forEach((daytime, i) => {
      const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];

      const newDate = new Date(daytime);
      const weekDay = newDate.getDay();
      const dayOfWeek = date.getDay() === weekDay ? 'Today' : weekDays[weekDay];

      const dailyTemps = Math.floor(
        (dailyTempMaxArray[i] + dailyTempMinArray[i]) / 2
      );
      const dailyForecastHtml = `
      <div class="SC--daily-forecasts">
                    <div class="SC--daily-forecast">
                      <p>${dayOfWeek}</p>
                      <p><span style="color: #fff">&#177;</span>${dailyTemps}°C</p>
                      <p>${dailyWindSpeedMaxArray[i]}${
        weatherData.daily_units.windspeed_10m_max
      }</p>
                      <p>
                        <img
                          src="${classifytemps(dailyTemps)}"
                          class="SC--hourly-weather-icon"
                          alt=""
                        />
                      </p>
                    </div>
      `;
      SCDailyForecasts.insertAdjacentHTML('beforeend', dailyForecastHtml);
    });
  } catch (err) {
    console.log(err);
  }
};
// ******
// --error function
const errorMessage = function (msg) {
  scSearchResults.insertAdjacentHTML(
    'beforeend',
    `
    <p class="errorinfo">${msg}</p>
  `
  );
};

// --Opacity function
const setOpacity = function (opacity) {
  scSearchResults.style.opacity = opacity;
};

// Handle click events using event delegation
function handleClick(e) {
  const targetResult = e.target.closest('.SC-search-result');
  if (targetResult) {
    console.log(targetResult.querySelector('.latnlong').textContent);
  }
}

//--Function for fetching
const FetchJSON = function (url, errorMessage = 'Something went wrong') {
  return fetch(url).then(response => {
    if (!response.ok) throw new Error(`${errorMessage}`);
    return response.json();
  });
};

//-- GET USER DEFAULT LATITUDE AND LONGITUDE
const getUserPosition = function () {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

// **CLOUD CONDITION FUNCTION
const cloudConditionCategory = function (cloudclover) {
  if (cloudclover < 10) {
    backgroundSection.style.backgroundImage = "url('weathers/clearsky.jpg')";
    return 'Clear Sky';
  } else if (cloudclover >= 10 && cloudclover <= 50) {
    backgroundSection.style.backgroundImage =
      "url('weathers/partlycloudy.jpg')";
    return 'Partly Cloudy';
  } else {
    backgroundSection.style.backgroundImage = "url('weathers/cloudy.jpg')";
    return 'cloudy';
  }
};

// TEMPERATURE CLASSIFICATION FUNCTION
const classifytemps = function (temp) {
  if (temp < 10) {
    // cold;
    return `tmp/cold.png`;
  } else if (temp > 10 && temp < 25) {
    // cool;
    return `tmp/cool.png`;
  } else if (temp >= 25 && temp < 30) {
    // warm;
    return `tmp/hot.png`;
  } else {
    // hot;
    return `tmp/hot.png`;
  }
};

//--------------------
cityInput.addEventListener('click', function (e) {
  e.preventDefault();
  cityInput.addEventListener('input', function () {
    const citiesInput = cityInput.value;
    if (citiesInput === '') {
      scSearchResults.style.opacity = 0;
    } else {
      fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${citiesInput}`
      )
        .then(res => {
          if (!res.ok) errorMessage('Not Found');
          return res.json();
        })
        .then(data => {
          scSearchResults.innerHTML = '';

          // making array for the promise
          const fetchingFlags = data.results.map(countries => {
            cityCountryCode = countries.country;
            cityCountryCode =
              cityCountryCode === 'United States'
                ? 'United States of America'
                : cityCountryCode;

            return fetch(
              `https://restcountries.com/v3.1/name/${cityCountryCode}`
            )
              .then(res2 => {
                if (!res2.ok) throw new Error('No Input Country Found');
                return res2.json();
              })
              .then(data2 => {
                countryFlag = data2[0].flags.svg;
                return countryFlag;
              })
              .catch(err => {
                err = errorMessage('The country does not exist');
              });
          });

          //promisifying all the array created earlier
          Promise.all(fetchingFlags).then(countryFlags => {
            scSearchResults.innerHTML = '';
            data.results.forEach((cities, i) => {
              cityName = cities.name;
              cityCountryCode = cities.country;
              cityLat = cities.latitude;
              cityLong = cities.longitude;
              countryFlag = countryFlags[i];

              const searchLocationHtml = `
              <div class="SC-search-result">
                <div class="SC-search-location-info">
                  <p class="SC-search-location">${cityName}, ${cityCountryCode}</p>
                  <span class="latnlong">${cityLat}, ${cityLong}</span>
                </div>
                <img src="${countryFlag}" alt="" class="SC-search-flag" />
              </div>
              `;
              //

              scSearchResults.insertAdjacentHTML(
                'beforeend',
                searchLocationHtml
              );
              scSearchResults.style.opacity = 1;
            });
          });
        })
        .catch(err => {
          err = errorMessage('Country not found');
          scSearchResults.style.opacity = 1;
        });
    }
  });
});

//SEARCH RESULT CLICK
scSearchResults.addEventListener('click', function (e) {
  setOpacity(0);
  cityInput.value = '';
  const resultContainer = e.target.closest('.SC-search-result');
  const lanlongInfo = resultContainer.querySelector('.latnlong').textContent;
  selectedLatAndlong = lanlongInfo.split(',');
  const clickedLat = Number(selectedLatAndlong[0]);
  const clickedLong = Number(selectedLatAndlong[1]);
  document.querySelectorAll('.SC-details').forEach(els => els.remove());
  document.querySelectorAll('.SC-hourly--TDI').forEach(els => els.remove());
  document.querySelectorAll('.SC--daily-forecast').forEach(els => els.remove());
  weatherAPP(clickedLat, clickedLong);
});

// Getting the weather data and working with it.
const getWeatherInfo = async function () {
  try {
    const posUser = await getUserPosition();
    const { latitude: lat, longitude: long } = posUser.coords;
    //
    weatherAPP(lat, long);
  } catch (err) {
    console.log(err);
  }
};
getWeatherInfo();

// RANDOM COUNTRIES
const randomCountriesGen = function () {
  const countriesNums = [];
  let randCountriesWeather;
  FetchJSON('https://restcountries.com/v3.1/all').then(data => {
    for (let i = 0; i < 3; i++) {
      const randNUms = Math.floor(Math.random() * data.length);
      if (!countriesNums.includes(randNUms)) {
        countriesNums.push(randNUms);
      }
    }
    countriesNums.forEach((nums, i) => {
      const randCountryName = data[nums].name.common;
      const randCountryCapital = data[nums].capital[0];
      const [lat, long] = data[nums].latlng;

      //fetching the tempearture
      return FetchJSON(
        `https://api.open-meteo.com/v1/gfs?latitude=${lat}&longitude=${long}&hourly=temperature_2m,relativehumidity_2m,cloudcover,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,windspeed_10m_max&current_weather=true&windspeed_unit=mph&timezone=auto`
      ).then(data4 => {
        // console.log(data4);
        randCountriesWeather = Math.floor(data4.current_weather.temperature);

        //rendering data
        SCOtherWeathers.style.opacity = 1;
        SCOtherWeathers.insertAdjacentHTML(
          'beforeend',
          `
          <div class="SC-random-countries SC--RC-${i + 1}">
                    <div class="SC--random">
                      <p class="SC-randCountries">${randCountryCapital},<span> ${randCountryName}</span></p>
                      <p class="SC-randWeather">${randCountriesWeather}°c <span><img src="${classifytemps(
            randCountriesWeather
          )}" class="SC--hourly-weather-icon" />
                      </span></p>
                    </div>
                  </div>
        `
        );
      });
    });
  });
};

setInterval(function () {
  document
    .querySelectorAll('.SC-random-countries')
    .forEach(els => els.remove());
  randomCountriesGen();
}, 300000);

document.addEventListener('DOMContentLoaded', randomCountriesGen);

// ---------------

// touch
let startX;
let scrollLeft;
const draggableElement = document.querySelector('.SC-hourly-details');
draggableElement.addEventListener('touchstart', e => {
  startX = e.touches[0].pageX - draggableElement.offsetLeft;
  scrollLeft = draggableElement.scrollLeft;
});

draggableElement.addEventListener('touchmove', e => {
  if (!startX) return;
  const x = e.touches[0].pageX - draggableElement.offsetLeft;
  const walk = (x - startX) * 2; // Adjust this multiplier to control scrolling speed
  draggableElement.scrollLeft = scrollLeft - walk;
});

draggableElement.addEventListener('touchend', () => {
  startX = null;
});

// auto background image resize for all devices
let newH;
const setImageHeight = function () {
  const deviceWidth = document.body.clientWidth;
  const deviceH = document.body.clientHeight;
  newH = deviceWidth <= 450 ? deviceH + deviceH * 0.85 : deviceH + 30;
  backgroundSection.style.height = newH + 'px';
};
setImageHeight();
