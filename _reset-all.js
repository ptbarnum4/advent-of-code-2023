const fs = require('fs/promises');

const createJs = (day = 1) =>
  `const fs = require('fs/promises');
   const path = require('path');

   /** @returns {Promise<string[]>} */
   const getParsedData = async (file = 'data.txt') => {
     const data = await fs.readFile(path.resolve(__dirname, file), 'utf8');
     return data.split(/\\r?\\n/);
   };

   const day${day} = async () => {
     const lines = await getParsedData();
     console.log(lines)
   };

   module.exports = day${day};
 `;

const createReadme = (day = 1) => `[Back](../README.md)

# Day ${day}: [Problem Name]

[Code](./index.js)

## Part One

> **PROMPT _PART 1_**

---

## Part Two

> **PROMPT _PART 2_**
`;

const main = async () => {
  const folders = await fs.readdir(__dirname);
  const dayFolders = folders.filter(folder => folder.startsWith('day'));

  for (const dayFolder of dayFolders) {
    const day = dayFolder.match(/\d+/gi)[0].padStart(2, '0');

    const jsPath = `${__dirname}/${dayFolder}/index.js`;
    const readmePath = `${__dirname}/${dayFolder}/README.md`;
    const txtPath = `${__dirname}/${dayFolder}/data.txt`;

    await fs.writeFile(jsPath, createJs(day));
    await fs.writeFile(readmePath, createReadme(day));
    await fs.writeFile(txtPath, '');
    console.log('Reset day: ', day);
  }
  console.log('Done!');
};
main();
