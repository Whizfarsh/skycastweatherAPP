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

//FUNCTIONS
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
    // console.log(citiesInput);
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
          // console.log(fetchingFlags);
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
scSearchResults.addEventListener('click', function (e) {
  setOpacity(0);
  cityInput.value = '';
  const resultContainer = e.target.closest('.SC-search-result');
  const lanlongInfo = resultContainer.querySelector('.latnlong').textContent;
  selectedLatAndlong = lanlongInfo.split(',');
  // FetchJSON('', 'Unable to the required data');
  // return selectedLatAndlong;
  // console.log(latAndlong);
  // console.log(selectedLatAndlong);
});

const getWeatherInfo = async function () {
  try {
    const posUser = await getUserPosition();
    const { latitude: lat, longitude: long } = posUser.coords;

    const weatherFatch = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=temperature_2m&current_weather=true&timezone=auto`
    );
    const weatherData = await weatherFatch.json();
    const tempData = weatherData.hourly.temperature_2m[24];
    const timeData = weatherData.hourly.time[24];
    console.log(timeData);
    console.log(tempData);
    console.log(weatherData);
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
