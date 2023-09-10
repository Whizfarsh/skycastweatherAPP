'use strict';

const cityInput = document.getElementById('citysearch');
const scSearchResults = document.querySelector('.SC-search-results');

// error function
const errorMessage = function (msg) {
  scSearchResults.insertAdjacentHTML(
    'beforeend',
    `
    <p class="errorinfo">${msg}</p>
  `
  );
};

cityInput.addEventListener('click', function (e) {
  e.preventDefault();
  cityInput.addEventListener('input', function () {
    const citiesInput = cityInput.value;
    console.log(citiesInput);
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
          console.log(data);
          scSearchResults.innerHTML = '';
          data.results.forEach(cities => {
            const cityName = cities.name;
            const cityCountryCode = cities.country_code;
            const cityLat = cities.latitude;
            const cityLong = cities.longitude;

            const searchLocationHtml = `
                  <div class="SC-search-result">
                    <div class="SC-search-location-info">
                      <p class="SC-search-location">${cityName}, ${cityCountryCode}</p>
                      <span class="latnlong">${cityLat}, ${cityLong}</span>
                    </div>
                    <img src="/weathers/sunny.jpg" alt="" class="SC-search-flag" />
                  </div>
                  `;
            //

            scSearchResults.insertAdjacentHTML('beforeend', searchLocationHtml);
            scSearchResults.style.opacity = 1;

            console.log('citiy Code', cityName, cityCountryCode);
            console.log('citiy lat and long', cityLat, cityLong);
          });
        })
        .catch(err => {
          err = errorMessage('Country not found');
          scSearchResults.style.opacity = 1;
        });
    }
  });
});

// for hourly scroll
const fetchCountries = function () {
  fetch('https://restcountries.com/v3.1/all')
    .then(res => res.json())
    .then(data => {
      const randNums = Math.floor(Math.random() * data.length);
      console.log(randNums);
      const ccc = data[randNums];
      //   console.log(`${data[randNums]}`);
      console.log(ccc.name.common);
    });
};
fetchCountries();

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
