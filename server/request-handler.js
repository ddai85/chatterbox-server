/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
const express = require('express');
const app = express();

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var messages = [];

var getHandler = function (request, response) {
  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  let parameterStringPart = request.url.split('?')[1];
  let parameters = {};
  if (parameterStringPart) {
    let parameterPairs = parameterStringPart.split('&');
    for (let pair of parameterPairs) {
      let keyValueArr = pair.split('=');
      parameters[keyValueArr[0]] = keyValueArr[1];
    }
  }
  let returnMessages = messages.slice();
  if (parameters.order === '-createdAt') {
    returnMessages = returnMessages.reverse();
  }
  if (parameters.limit) {
    let limit = parseInt(parameters.limit, 10);
    returnMessages = returnMessages.slice(0, limit); 
  }

  let headers = defaultCorsHeaders;
  headers['Content-Type'] = 'application/json';
  response.writeHead(200, headers);
  response.end(JSON.stringify({results: returnMessages}));
};

var postHandler = function (request, response) {
  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  let headers = defaultCorsHeaders;
  headers['Content-Type'] = 'application/json';
  response.writeHead(201, headers);
  
  let body = [];
  request.on('data', (chunk) => {
    body.push(chunk);
  });
  request.on('end', () => {
    body = body.toString();
    let message = JSON.parse(body);
    message.createdAt = new Date();
    messages.push(message);
    response.end(JSON.stringify({results: messages}));
  });
};

var optionsHandler = function (request, response) {
  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = 'text/plain';
  response.writeHead(200, headers);
  response.end();
};

var notFoundHandler = function (request, response) {
  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = 'text/plain';
  response.writeHead(404, headers);
  response.end();
};

var deleteHandler = function (request, response) {
  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = 'text/plain';
  response.writeHead(403, headers);
  response.end();
};

var path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/chatterbox/classes/messages', (req, res) => {
  getHandler(req, res);
});

app.post('/chatterbox/classes/messages', (req, res) => {
  postHandler(req, res);
});

app.post('/chatterbox/classes/room', (req, res) => {
  postHandler(req, res);
});

app.options('/*', (req, res) => {
  optionsHandler(req, res);
});

app.delete('/*', (req, res) => {
  deleteHandler(req, res);
});

module.exports = app;

