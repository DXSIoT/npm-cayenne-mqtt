cayenne-mqtt
============

# npm install

````
npm install cayenne-mqtt
````

# usage

````javascript
var Cayenne = require('cayenne-mqtt');
var options = {
  'clientId' : '',
  'username' : '',
  'password' : ''
}
var Client = new Cayenne.Client(options);
Client.connect();

var Ch1 = Client.Channel('1');
var Ch2 = Client.Channel('2');

Ch1.on('message',function(msg){   
  if(msg == '1') Ch2.publish('0');
  if(msg == '0') Ch2.publish('1');
});

````

# documentation


