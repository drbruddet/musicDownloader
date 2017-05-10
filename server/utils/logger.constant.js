const chalk = require('chalk');

const logger = {
    startDl(title) {
        chalk.blue('Downloading video ' + chalk.bold(title) + ' from YouTube...')
    },
    endDl: chalk.green('Stream from youtube is over.'),
    urlToConvert(url) {
        chalk.yellow('Fetch URL from client: ' + url)
    },
    tempWrite(chunk, total) {
        chalk.blue('writing YouTube stream on disk ... ' + chunk + '/' + total)
    },
};

module.exports = logger;
