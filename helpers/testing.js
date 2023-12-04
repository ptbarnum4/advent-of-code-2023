const c = require('cli-color');

const passLog = str => console.log(c.greenBright(`${str} => Pass`));
const failLog = str => console.log(c.redBright(`${str} => Fail`));
const spacerLog = (str = '') =>
  console.log(c.magentaBright(`\n-----------${str || ''}-----------\n`));
const titleLog = (str = '', newline = true) =>
  console.log(`${newline ? '\n' : ''}${c.yellowBright.bold.underline(str)}`);
const testLog = (result, expectedResult) =>
  result === expectedResult ? passLog : failLog;

module.exports = {
  passLog,
  failLog,
  spacerLog,
  titleLog,
  testLog
};
