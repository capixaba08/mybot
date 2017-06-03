var apiai = require('apiai');

var app = apiai("e095ccbab11b4a6297c0f6cb460f08a7");

var request = app.textRequest('ola', {
    sessionId: '7684522f-3e0c-49bf-b269-efd6ae3e4977'
});

request.on('response', function(response) {
    console.log(response);
});

request.on('error', function(error) {
    console.log(error);
});

request.end();