//all all of your code

//npm packages

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

const token = process.env.FB_VERIFY_TOKEN
const access = process.env.FB_ACCESS_TOKEN

app.set('port', (process.env.PORT || 5000))

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/', function (req, res) {
    res.send('Hello Everyone! I am a bot!')
})

app.post('/webhook', function (req, res) {

  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});
  
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  var apiai = require('apiai');
  var jsonResponse;  
  var app = apiai("e095ccbab11b4a6297c0f6cb460f08a7");

  var request = app.textRequest('ola', {
      sessionId: '7684522f-3e0c-49bf-b269-efd6ae3e4977'
  });

  request.on('response', function(response) {
      console.log("Inicio... ");
      console.log(response.toString());
      jsonResponse = JSON.parse(response);
  });

  request.on('error', function(error) {
      console.log(error);
  });

  request.end();  



  /*//The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
  console.log("ENTROU!!!!");
  var options = {
    host: 'https://api.api.ai',
    path: '/api/query?v=20150910&query=ola&lang=pt-br&sessionId=7684522f-3e0c-49bf-b269-efd6ae3e4977&timezone=2017-06-02T19:42:04-0300',
    headers: {'Authorization': 'Bearer e095ccbab11b4a6297c0f6cb460f08a7'},
    method: 'GET'
  };
  var req = http.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
    });
  });  
  
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  // write data to request body
  req.write('data\n');
  req.write('data\n');
  req.end();

  console.log("SAIU!!!!");
/*
  callback = function(response) {
    var str = '';

    //another chunk of data has been recieved, so append it to `str`
    response.on('data', function (chunk) {
      str += chunk;
      console.log("e o DATA ehhhh....   " +str+ " e foi tudo");
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function () {
      console.log("e o DATA + END ehhhh....   " +str+ " e foi tudo");
    });
  }

  http.request(options, callback).end();
*/
  console.log("Consulta base de dados SQL.... ID = " +senderID );

  /*var pg = require('pg');
  var query = "SELECT * FROM customers where id = ";
  query += senderID;
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query(query, function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       //{ response.render('pages/db', {results: result.rows} ); }
       {
         if (result.rowCount == 0) 
         {
             query = "INSERT INTO customers VALUES (" + senderID + ", 'Usuário', current_date, '', '')";
             client.query(query, function(err, result) {
                 done();
                 if (err) { console.error(err); response.send("Error " + err);}
                 else { console.log ("User " + senderID + " added!");}
            }); 
         } else console.log("User " + senderID + " found!"); }
    });
  });
  */


  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID);
        break;

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function sendGenericMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",               
            image_url: "http://messengerdemo.parseapp.com/img/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",               
            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: access },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

app.get('/webhook', function(req, res) {
    if  (req.query['hub.verify_token'] === token) {
        res.send(req.query['hub.challenge'])
    }
    res.send('No query')
})

app.listen(app.get('port'), function() { 
    console.log('running on port', app.get('port'))
})