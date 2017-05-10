const chalk   = require('chalk')
const ffmpeg  = require('fluent-ffmpeg');

class VideoConverter {

    static destinationFormat() { return 'mp3' };
    static codec() { return 'libmp3lame' };

    constructor() {
        console.log(chalk.cyan('video converter'))
    }

    convert(
        sourceFile,
        options = {
           format: VideoConverter.destinationFormat(),
           codec: VideoConverter.codec()
        }
    ) {

        if (!sourceFile) {
            throw new Error('Source is mandatory to convert a file.')
        }

        console.log(chalk.blue('Starting conversion to ') + chalk.bold(VideoConverter.destinationFormat()) + ' ...')

        const readableStream = ffmpeg()
            .input(sourceFile)
            .withAudioCodec(options.codec)
            .toFormat(options.format)
            .on('progress', (progress) => {
                console.log(chalk.blue('ffmpeg processing ... ' + chalk.bold(progress.targetSize + 'KB') + ' converted'))
            })
            .on('error', (err) => {
                console.log(chalk.red('ffmpeg Error: ' + chalk.bold(err.message)))
            })
            .on('end', () => {
                console.log(chalk.green('ffmpeg conversion ' + chalk.bold('done')))
            })

        return readableStream;
    }

};

module.exports = VideoConverter;
