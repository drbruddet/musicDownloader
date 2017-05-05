const path    = require('path')
const express = require('express')
const fs      = require('fs')
const ytdl    = require('ytdl-core')
const ffmpeg  = require('fluent-ffmpeg');

const app = express()
const hostname = '127.0.0.1'
const port = 3000

const url = 'https://www.youtube.com/watch?v=kK4D5R-0mY0'

getMediaTitle = (url, getTitle) => {
  ytdl.getInfo(url, function(err, info) {
    getTitle(info.title)
  })
}

app.get('/', (request, response) => {

  const SOURCE_FORMAT = 'mp4';
  const DESTINATION_FORMAT = 'mp3';
  const CODEC = 'libmp3lame';

  let totalLength = 0;
  const stream = ytdl(url, {
    filter: (format) => format.container === SOURCE_FORMAT && !format.encoding
  })

  try {

    getMediaTitle(url, function(title) {
      const formatTitle = title + '.' + DESTINATION_FORMAT
      response.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename=' + formatTitle,
        'Access-Control-Allow-Origin': 'http://localhost:8080'
        //'Content-Length': length
      })
    })

    ffmpeg()
    .input(stream)
    .withAudioCodec(CODEC)
    .toFormat(DESTINATION_FORMAT)
    .on('error', (err) => {
      console.log('ffmpeg Error: ' + err.message)
    })
    .on('progress', (progress) => {
      console.log('ffmpeg Processing: ' + progress.targetSize + ' KB converted')
    })
    .on('end', () => {
      console.log('ffmpeg : DOWNLOAD FINISHED\n')
    })
    .pipe(response, {end:true});

  } catch (error) {
    response.end(error);
    response.status(500);
  }
});

app.listen(port, hostname, (error) => {
  if (error) return console.error(error)
  console.log(`Server running at http://${hostname}:${port}/`)
})
