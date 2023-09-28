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
    // console.log(weatherData);
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
    timeData.forEach((theTime, i) => {
      if (theTime >= currentWeatherTime) {
        dateRange.push(theTime);
        tempRange.push(tempData[i]);
        cloudRange.push(cloudData[i]);
        humidityRange.push(himidityData[i]);
        windSpeedRange.push(windspeedData[i]);
      }
    });
    tempRange = tempRange.splice(0, 24);
    dateRange = dateRange.slice(0, 24);
    cloudRange = cloudRange.splice(0, 24);
    humidityRange = humidityRange.splice(0, 24);
    windSpeedRange = windSpeedRange.splice(0, 24);

    dateRange.forEach((datesandtime, i) => {
      const onlyTime = datesandtime.split('T');
      if (timeNow === onlyTime[1]) {
        onlyTime[1] = 'Now';

        // insert weather inormations like cloudcover, wind speed, humidity
        const weatherInfoHtml = `
      <p class="SC-details"><span>Cloudy</span> ${cloudRange[i]}${weatherData.hourly_units.cloudcover}</p>
                <p class="SC-details"><span>Humidity</span> ${humidityRange[i]}${weatherData.hourly_units.relativehumidity_2m}</p>
                <p class="SC-details"><span>WindSpeed</span> ${windSpeedRange[i]}${weatherData.hourly_units.windspeed_10m}</p>
      `;
        SCDetails.insertAdjacentHTML('beforebegin', weatherInfoHtml);
      }
      const hourlyHtml = `
      <div class="SC-hourly--TDI">
                      <span>${onlyTime[1]}</span>
                      <span>${Math.round(tempRange[i])}°c</span>
                      <span
                        ><img
                          src="icons/sun.png"
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
                      <p>${dailyWindSpeedMaxArray[i]}${weatherData.daily_units.windspeed_10m_max}</p>
                      <p>
                        <img
                          src="icons/sun.png"
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
  fetch(url).then(response => {
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
// touch
let startX;
let scrollLeft;
const draggableElement = document.querySelector('.SC-hourly-details');

// console.log(startX, scrollLeft);
// console.log(`ofS1: ${draggableElement.offsetLeft}`);
draggableElement.addEventListener('touchstart', e => {
  // console.log(e);
  // console.log(`T1: ${e.touches[0].pageX}`);
  startX = e.touches[0].pageX - draggableElement.offsetLeft;
  // console.log(`StartX2: ${startX}`);
  // console.log(draggableElement.scrollLeft);
  //   console.log(draggableElement.offsetLeft);
  scrollLeft = draggableElement.scrollLeft;
  // console.log(`S2: ${scrollLeft}`);
});

draggableElement.addEventListener('touchmove', e => {
  // console.log(`StrX: ${startX}`);
  // console.log(`T1: ${e.touches[0].pageX}`);
  if (!startX) return;

  console.log(`ofS2: ${draggableElement.offsetLeft}`);
  const x = e.touches[0].pageX - draggableElement.offsetLeft;
  console.log(`X: ${x}`);
  console.log(`S3: ${draggableElement.scrollLeft}`);
  const walk = (x - startX) * 2; // Adjust this multiplier to control scrolling speed
  console.log(`WK: ${walk}`);
  draggableElement.scrollLeft = scrollLeft - walk;
  console.log(`S4: ${(draggableElement.scrollLeft = scrollLeft - walk)}`);
  console.log(`S4: ${draggableElement.scrollLeft}`);
});

draggableElement.addEventListener('touchend', () => {
  startX = null;
});

//auto background image resize for all devices
const setImageHeight = function () {
  const contentHeight = document.body.scrollHeight;
  const backgroundSection = document.querySelector('.skycastmain-body');
  const newH = contentHeight + 30;
  backgroundSection.style.height = newH + 'px';
};
window.addEventListener('load', setImageHeight);
window.addEventListener('resize', setImageHeight);
