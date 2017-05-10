const ffmpeg  = require('fluent-ffmpeg');
const chalk   = require('chalk')
const Promise = require('bluebird')
const logger  = require('./logger.constant')

const videoConverter = {

    convertToMp3: (sourceFile) => {

        const DESTINATION_FORMAT = 'mp3';
        const CODEC = 'libmp3lame';

        console.log(chalk.green('Finished to write temp file on disk: ') + chalk.bold(sourceFile))
        console.log(chalk.blue('Starting conversion to ') + chalk.bold(DESTINATION_FORMAT) + ' ...')

        return new Promise(function(resolve, reject) {
            ffmpeg()
            .input(sourceFile)
            .withAudioCodec(CODEC)
            .toFormat(DESTINATION_FORMAT)
            .on('progress', (progress) => {
                console.log(chalk.blue('ffmpeg processing ... ' + chalk.bold(progress.targetSize + 'KB') + ' converted'))
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

module.exports = videoConverter;
