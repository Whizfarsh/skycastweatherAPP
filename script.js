'use strict';

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

//
const setImageHeight = function () {
  const contentHeight = document.body.scrollHeight;
  const backgroundSection = document.querySelector('.skycastmain-body');
  const newH = contentHeight + 30;
  backgroundSection.style.height = newH + 'px';
};
window.addEventListener('load', setImageHeight);
window.addEventListener('resize', setImageHeight);
