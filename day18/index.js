const fs = require('fs/promises');
   const path = require('path');

   /** @returns {Promise<string[]>} */
   const getParsedData = async (file = 'data.txt') => {
     const data = await fs.readFile(path.resolve(__dirname, file), 'utf8');
     return data.split(/\r?\n/);
   };

   const day18 = async () => {
     const lines = await getParsedData();
     console.log(lines);
   };

   module.exports = day18;
 
