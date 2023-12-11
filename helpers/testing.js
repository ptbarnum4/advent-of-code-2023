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

const trackTime = () => {
  const opts = {
    startTime: Date.now()
  };

  return {
    time: () => {
      const start = opts.startTime;
      const now = Date.now();

      const ms = now - start;
      const seconds = Math.floor(ms / 1000) % 60;
      const minutes = Math.floor(ms / 1000 / 60) % 60;
      const hours = Math.floor(ms / 1000 / 60 / 60) % 24;
      const rem = Number(((ms % 1000) / 1000).toFixed(3));

      const fullSeconds = seconds + rem;

      return {
        ms,
        seconds,
        minutes,
        hours,
        format: str => {
          str = str.replaceAll(/\{ ?seconds ?\}/gi, fullSeconds);
          str = str.replaceAll(/\{ ?minutes ?\}/gi, minutes);
          str = str.replaceAll(/\{ ?hours ?\}/gi, hours);
          return str;
        }
      };
    },
    reset: () => {
      opts.startTime = Date.now();
    }
  };
};

module.exports = {
  passLog,
  failLog,
  spacerLog,
  titleLog,
  testLog,
  trackTime
};
