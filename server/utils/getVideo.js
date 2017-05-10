const chalk   = require('chalk')
const Promise = require('bluebird')
const logger  = require('./logger.constant')
const ytdl    = require('ytdl-core')

const getVideo = {

    youtube: (target) => {

        const SOURCE_FORMAT = 'mp4';

        let title   = null;

        return new Promise(function (resolve, reject) {
            ytdl(target, {
                filter: (format) => format.container === SOURCE_FORMAT && !format.encoding
            })
            .on('info', (info, format) => title = info.title)
            .on('progress', (chunkLength, totalDownloaded, totalLength) => {
                if (totalDownloaded === totalLength) console.log(logger.endDl);
            })
            .on('error', (err) => {
                console.log(chalk.red('ffmpeg Error: ' + chalk.bold(err.message)))
                reject(err)
            })
            .on('end', () => {
                resolve()
            })
        })
    }

};

module.exports = getVideo;
