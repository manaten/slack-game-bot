const bunyan = require('bunyan');
const PrettyStream = require('bunyan-prettystream');

module.exports = function createLogger(name) {
  const prettyStdOut = new PrettyStream();
  prettyStdOut.pipe(process.stdout);
  return bunyan.createLogger({
    name,
    streams: [{
      level: process.env.LOG_LEVEL || 'info',
      type: 'raw',
      stream: prettyStdOut
    }]
  });
};
