const chalk = require('chalk');

const logger = {
    startDl(title) {
        chalk.blue('Downloading video ' + chalk.bold(title) + ' from YouTube...') 
    },
    endDl: chalk.green('Stream from youtube is over.'),
    tempWrite(chunk, total) { 
        chalk.blue('writing YouTube stream on disk ... ' + chunk + '/' + total) 
    },
};

module.exports = logger;