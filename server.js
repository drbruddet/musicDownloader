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
      response.setHeader('Content-Disposition', 'attachment; filename=' + title + '.' + DESTINATION_FORMAT);
      response.setHeader('Content-type', 'audio/mpeg')
    })

    ffmpeg()
    .input(stream)
    .withAudioCodec(CODEC)
    .toFormat(DESTINATION_FORMAT)
    .on('error', (err) => {
      console.log('an error happened: ' + err.message)
    })
    .on('progress', (progress) => {
      console.log('Processing: ' + progress.targetSize + ' KB converted')
    })
    .on('end', () => {
      console.log('DOWNLOAD FINISHED\n')
    })
    .pipe(response);

  } catch (error) {
    res.end(error);
    res.status(500);
  }
});

app.listen(port, hostname, (error) => {
  if (error) return console.error(error)
  console.log(`Server running at http://${hostname}:${port}/`)
})
