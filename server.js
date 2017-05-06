const path    = require('path')
const express = require('express')
const fs      = require('fs')
const ytdl    = require('ytdl-core')
const ffmpeg  = require('fluent-ffmpeg')
const chalk   = require('chalk')
const logger  = require('./logger.constant')

const app = express()
const hostname = '127.0.0.1'
const port = 2000

const SOURCE_FORMAT = 'mp4';
const DESTINATION_FORMAT = 'mp3';
const CODEC = 'libmp3lame';
const SOURCE_FILE = __dirname + '/youtube-video.' + SOURCE_FORMAT;

const target = 'https://www.youtube.com/watch?v=kK4D5R-0mY0'

app.get('/', (request, response) => {

  let prevent = false,
      title   = null;

  try {
    ytdl(target, {
      filter: (format) => format.container === SOURCE_FORMAT && !format.encoding
    })
      .on('info', (info, format) => title = info.title)
      .on('progress', (chunkLength, totalDownloaded, totalLength) => {
        if (totalDownloaded === totalLength) console.log(logger.endDl);
        if (!prevent) {
          console.log(logger.startDl(title));
          prevent = true;
        }
      })
      .pipe(fs.createWriteStream(SOURCE_FILE))
      .on('progress', (chunk, total) => {
        console.log(logger.tempWrite(chunk, total))
      })
      .on('finish', () => {
        console.log(chalk.green('Finished to write temp file on disk: ') + chalk.bold(SOURCE_FILE))
        console.log(chalk.blue('Starting conversion to ') + chalk.bold(DESTINATION_FORMAT) + ' ...')
        
        response.writeHead(200, {
          'Content-Type': `audio/${DESTINATION_FORMAT}`,
          'Content-Disposition': 'attachment; filename=' + title,
          'Access-Control-Allow-Origin': 'http://localhost:8080'
        })

        ffmpeg()
          .input(SOURCE_FILE)
          .withAudioCodec(CODEC)
          .toFormat(DESTINATION_FORMAT)
          .on('progress', (progress) => {
            console.log(chalk.blue('ffmpeg processing ... ' + chalk.bold(progress.targetSize + 'KB') + ' converted'))
          })
          .on('error', (err) => {
            console.log(chalk.red('ffmpeg Error: ' + chalk.bold(err.message)))
          })
          .pipe(response, {end: true})
          .on('data', (progress) => console.log(chalk.magenta('Now streaming to client, done at ' + chalk.bold(progress.percent))))
          .on('finish', () => {
            console.log(chalk.green('Finished to emit stream to the client'))
            fs.unlink(SOURCE_FILE, () => console.log(chalk.green('Deleted temp file ') + chalk.bold(SOURCE_FILE)))
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
