const chalk   = require('chalk')
const ytdl    = require('ytdl-core')

class VideoDownloader {

    constructor() {
        this.title = null;
    }

    youtube(target) {
        const SOURCE_FORMAT = 'mp4';

        return ytdl(target, {
            filter: (format) => format.container === SOURCE_FORMAT && !format.encoding
        })
        .on('info', (info, format) => this.title = info.title)
        .on('error', (err) => {
            console.log(chalk.red('ytdl Error: ' + chalk.bold(err.message)))
        })
        .on('end', () => {
            console.log(chalk.green('ytdl complete dl ' + chalk.bold('done')))
        })
    }

};

module.exports = VideoDownloader;
