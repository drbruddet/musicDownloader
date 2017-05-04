'use strict'
const path    = require('path')
const express = require('express')
const fs      = require('fs')
const ytdl    = require('ytdl-core')
const ffmpeg  = require('fluent-ffmpeg');

const app = express()
const hostname = '127.0.0.1'
const port = 3000

const url = 'https://www.youtube.com/watch?v=kK4D5R-0mY0'

const setHeaders = (response) => {
  ytdl.getInfo(url, function(err, info) {
    if (err) throw err
    response.setHeader('Content-disposition', 'attachment; filename=' + info.title + '.mp3')
    response.setHeader('Content-type', 'audio/mpeg')
  })
}

const downloadVideo = (request, response) => {
  setHeaders(response)
  // GET VIDEO AND TRANSFORM IT TO AUDIO
  const source = ytdl(url, { filter: (f) => f.container === 'mp4' && !f.encoding })
  const sound = ffmpeg({ source: source })
  sound.withAudioCodec('libmp3lame')
  sound.toFormat('mp3')
  sound.output(response)
  sound.run()
  sound.on('end', () => {
    console.log('DOWNLOAD FINISHED\n')
  })
  sound.on('error', (err) => {
    console.log('an error happened: ' + err.message)
  })
  sound.on('progress', (progress) => {
    console.log('Processing: ' + progress.targetSize + ' KB converted')
  })
}

app.get('/', downloadVideo)

app.listen(port, hostname, (error) => {
  if (error) {
    return console.log('something bad happened', error)
  }
  console.log(`Server running at http://${hostname}:${port}/`)
})
