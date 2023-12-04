const fs = require('fs/promises');
const path = require('path');

const createSVG = (n, pass) => {
  const color = pass ? '#32FF7D' : '#FF5A46';
  return `
  <svg viewBox="0 0 125 50" xmlns="http://www.w3.org/2000/svg" fill="${color}">
    <text font-family="'Trebuchet MS', sans-serif" font-weight="700" y="45" x="10" font-size="32px">Day ${n}</text>
  </svg>
  `;
};

const main = async () => {
  for (let i = 1; i <= 25; i++) {
    const filePath = path.resolve(__dirname, 'badges');
    await fs.writeFile(
      path.resolve(filePath, 'complete', `day${i}.svg`),
      createSVG(i, true)
    );
    await fs.writeFile(
      path.resolve(filePath, 'incomplete', `day${i}.svg`),
      createSVG(i, false)
    );
  }
};

main();
