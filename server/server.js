const path    = require('path')
const express = require('express')
const fs      = require('fs')
const ytdl    = require('ytdl-core')
const chalk   = require('chalk')
const logger  = require('./utils/logger.constant')
const videoConverter = require('./utils/videoConverter')
var url = require("url")

const app = express()
const hostname = '127.0.0.1'
const port = 2000

const SOURCE_FORMAT = 'mp4';
const SOURCE_FILE = __dirname + '/youtube-video.' + SOURCE_FORMAT;
const DESTINATION_FORMAT = 'mp3';

//const target = "https://www.youtube.com/watch?v=P4j3nCcMJfM";

app.get('/', (request, response) => {

    let title   = null;

    try {
        const target = request.query.url;

        // LOGGER MARCHE PAS, Undefined
        console.log(logger.startDl("TOTO"));

        ytdl(target, {
            filter: (format) => format.container === SOURCE_FORMAT && !format.encoding
        })
        .on('info', (info, format) => title = info.title)
        .on('progress', (chunkLength, totalDownloaded, totalLength) => {
            if (totalDownloaded === totalLength) console.log(logger.endDl);
        })
        .pipe(fs.createWriteStream(SOURCE_FILE))
        .on('finish', () => {
            response.writeHead(200, {
                'Content-Type': `audio/mpeg`,
                'Content-Disposition': 'attachment; filename=' + title + '.' + DESTINATION_FORMAT,
                'Access-Control-Allow-Origin': '*',
            })
            videoConverter.convertToMp3(SOURCE_FILE).then((converted) => {
                converted.pipe(response, {end: true})
                converted.on('finish', () => {
                    console.log(chalk.green('Finished to emit stream to the client'))
                    fs.unlink(sourceFile, () => console.log(chalk.green('Deleted temp file ') + chalk.bold(sourceFile)))
                })
            })
        })
    } catch (error) {
        response.status(500).send(error);
    }
});

app.listen(port, hostname, (error) => {
    if (error) return console.error(error)
    console.log(`Server running at http://${hostname}:${port}/`)
})
