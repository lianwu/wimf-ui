var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var responseTime = require('response-time');
var app = express();
var listenPort = process.env.PORT || 3030;

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.listen(listenPort);

console.info('Starting server on port %s', listenPort);
