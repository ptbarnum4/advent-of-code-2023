const c = require('cli-color');

const passLog = str => console.log(c.greenBright(`${str} => Pass`));
const failLog = str => console.log(c.redBright(`${str} => Fail`));
const spacerLog = (str = '', newline = true, preLine = true) =>
  console.log(
    c.magentaBright(
      `${preLine ? '\n' : ''}-----------${str || ''}-----------${
        newline ? '\n' : ''
      }`
    )
  );
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
