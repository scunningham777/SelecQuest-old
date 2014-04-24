var express = require('express');
var app = express();

app.get('/', function(req, res){
  res.send('index.html');
});
app.get('/partials/:name', function (req, res) {
  var name = req.params.name;
  res.render('views/' + name);
});

var server = app.listen(8888, function() {
    console.log('Listening on port %d', server.address().port);
});