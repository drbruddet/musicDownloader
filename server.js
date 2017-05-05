const path    = require('path')
const express = require('express')
const fs      = require('fs')
const ytdl    = require('ytdl-core')
const ffmpeg  = require('fluent-ffmpeg')
const chalk   = require('chalk')

const app = express()
const hostname = '127.0.0.1'
const port = 2000

const SOURCE_FORMAT = 'mp4';
const DESTINATION_FORMAT = 'mp3';
const CODEC = 'libmp3lame';
const SOURCE_FILE = __dirname + '/youtube-video.' + SOURCE_FORMAT;

const target = 'https://www.youtube.com/watch?v=kK4D5R-0mY0'

const getMediaTitle = (url, getTitle) => {
  ytdl.getInfo(url, (err, info) => {
    getTitle(info.title)
  })
};

app.get('/', (request, response) => {

  let prevent = false;
  let title = null;
  try {
    ytdl(target, {
      filter: (format) => format.container === SOURCE_FORMAT && !format.encoding
    })
    .on('info', (info, format) => title = info.title)
    .on('progress', (chunkLength, totalDownloaded, totalLength) => {
      if (totalDownloaded === totalLength) console.info(chalk.green('Stream from youtube is over.'));
      if (!prevent) {
        console.info(chalk.blue('Downloading video ' + chalk.bold(title) + ' from YouTube...'));
        prevent = true;
      }
    })
    .pipe(fs.createWriteStream(SOURCE_FILE))
    .on('progress', (chunk, total) => {
      console.info(chalk.blue('writing YouTube stream on disk ... ' + chunk + '/' + total))
    })
    .on('finish', () => {
      console.info(chalk.green('Finished to write on disk: ') + chalk.bold(SOURCE_FILE))
      console.info(chalk.blue('Starting conversion to ') + chalk.bold(DESTINATION_FORMAT) + ' ...')
      
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
        .on('progress', (progress) => console.log(chalk.magenta('Now streaming to client, done at ' + chalk.bold(progress.percent))))
        .on('finish', () => console.log(chalk.blue('Finished to emit to client')) )
    })
  } catch (error) {
    response.status(500).send(error);
  }
});

app.listen(port, hostname, (error) => {
  if (error) return console.error(error)
  console.log(`Server running at http://${hostname}:${port}/`)
})
