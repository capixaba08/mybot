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
  
function runAction (response, action) {
  console.log("Action = " + action);
  console.log("Response = " + response.result.action);
  var pg = require('pg');
  var query = "SELECT * FROM products";
  var strReturn = "";
  pg.connect(process.env.DATABASE_URL, function(err, client) {
    client.query('SELECT * FROM products;')
    .on('row', function(row) { 
        console.log(JSON.stringify(row));
        console.log(row.id + "  " + row.name + "  R$" + row.price);
        strReturn += row.id + "  " + row.name + "  R$" + row.price;
      });
  });
  return strReturn;

  /*  client.query(query, function(err, result) {
      done();
      if (err) {
        console.error(err); response.send("Error " + err); }
      else
      //{ response.render('pages/db', {results: result.rows} ); }
        for (var i = 0; i < result.rowCount; i++) {
          console.log ("Result" + result.rows[i]); } 
    });
  });
  */
}

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  var apiai = require('apiai');
  var jsonResponse;  
  var app = apiai("e095ccbab11b4a6297c0f6cb460f08a7");

  var strResponse = "";

  console.log("Event.message = " + message.text);
  var request = app.textRequest(message.text, {
      sessionId: senderID
  });

  request.on('response', function(response) {
      console.log(response);
      console.log("Received message for user %d and page %d at %d with message:", 
        senderID, recipientID, timeOfMessage);
      console.log(JSON.stringify(message));

      var messageId = message.mid;
      var messageText = message.text;
      messageText = response.result.fulfillment.messages[0]['speech'];
      //messageText += "\n";
      
      if (response.result.action != '') {
        messageText += runAction(response, response.result.action);
      }
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

  });

  request.on('error', function(error) {
      console.log(error);
  });

  request.end();  

  
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