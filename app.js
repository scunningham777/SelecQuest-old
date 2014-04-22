var express = require('express');
var app = express();

app.get('/', function(req, res){
  res.send('index.html');
});

var server = app.listen(8888, function() {
    console.log('Listening on port %d', server.address().port);
});