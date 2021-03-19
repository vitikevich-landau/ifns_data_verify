const first = (array) => (array && array.length ? array[0] : undefined);
const second = (array) => (array && array.length ? array[1] : undefined);
const third = (array) => (array && array.length ? array[2] : undefined);
const fourth = (array) => (array && array.length ? array[3] : undefined);
const five = (array) => (array && array.length ? array[4] : undefined);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  first,
  second,
  third,
  fourth,
  five,
  delay,
};
