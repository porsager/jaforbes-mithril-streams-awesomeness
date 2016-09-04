// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var tsify = require('tsify')
var browserify = require('browserify')

app.use(express.static('public'))

app.get('*/bundle.js', function(req, res){
  
  browserify()
    .add('public/client.js')
    .plugin(tsify, { noImplicitAny: true })
    .bundle()
    .on('error', function (error) { console.error(error.toString()); })
    .pipe(res)
})

app.get("*", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});