const path    = require('path')
const express = require('express')
const fs      = require('fs')
const chalk   = require('chalk')

const logger           = require('./utils/logger.constant')
const VideoConverter   = require('./utils/videoConverter')
const VideoDownloader  = require('./utils/videoDownloader')

var url = require("url")

const app = express()
const hostname = '127.0.0.1'
const port = 2000

const SOURCE_FORMAT = 'mp4';

const VideoDownloaderService = new VideoDownloader();
const VideoConverterService = new VideoConverter();

app.get('/', (request, response) => {

    const tempFilePath = __dirname + '/youtube-video.' + SOURCE_FORMAT;
    const target = request.query.url || 'https://www.youtube.com/watch?v=P4j3nCcMJfM'; // default value for dev
    const destinationFormat = request.params.format || 'mp3';

    try {
        VideoDownloaderService
            .youtube(target)
            .pipe(fs.createWriteStream(tempFilePath))
            .on('finish', () => {
                // write head
                const { title } = VideoDownloaderService;
                response.writeHead(200, {
                    'Content-Type': `audio/mpeg`,
                    'Content-Disposition': 'attachment; filename=' + title + '.' + destinationFormat,
                    'Access-Control-Allow-Origin': '*'
                })
                VideoConverterService
                    .convert(tempFilePath)
                    .pipe(response, {end: true})
                    .on('finish', () => {
                        console.log(chalk.green('Finished to emit stream to the client'))
                        fs.unlink(tempFilePath, () => console.log(chalk.green('Deleted temp file ') + chalk.bold(tempFilePath)))
                    })
            })

    } catch (error) {
        response
            .status(500)
            .send(error);
    }
});

app.listen(port, hostname, (error) => {
    if (error) return console.error(error)
    console.log(`Server running at http://${hostname}:${port}/`)
})
