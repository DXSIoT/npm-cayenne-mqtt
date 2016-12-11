
/*
 * Cayenne Client
 */
 
var mqtt = require('mqtt');
var events = require('events');
var util = require('util');  
var MqttClient;

var Channel = require('./Channel');

var Client = function (options) {  	
  	var clientId,username,password;
  	var MqttClient;
  	var topics;
  	var listeners;  	
  	var channnels;

  	this.debug = options && options.debug || false;  	
  	this.server = options && options.server || 'mqtt://mqtt.mydevices.com';
  	this.clientId = options.clientId;
  	this.username = options.username;
  	this.password = options.password;
  	
  	this.channnels = {};
  	this.listeners = {};
  	this.topics = {};

  	this.emit('init');
  	return this;
}
util.inherits(Client, events.EventEmitter);

Client.prototype.buildTopicPub = function(channel){
	return 'v1/'+ this.username + '/things/' + this.clientId + '/data/' + channel;
}
Client.prototype.buildTopicSub = function(channel){
	return 'v1/'+ this.username + '/things/' + this.clientId + '/cmd/' + channel;
}
Client.prototype.buildTopicRes = function(){
	return 'v1/'+ this.username + '/things/' + this.clientId + '/response';
}

Client.prototype.connect = function(callback) {
	var self = this;
	MqttClient = self.MqttClient = mqtt.connect(self.server,{
		clientId: self.clientId,
		username: self.username,
		password: self.password
	});
	self.emit('connect',self);
	self.MqttClient.on('connect', function(){ self.emit('connect'); });
	self.MqttClient.on('message', function (topic, message,packet){		
		self.handleMessage(topic,message,packet);
	});
	if(callback) callback();
  	return this;
}

Client.prototype.suscribe = function(channel){
	var self = this;
	var topic = 'v1/'+ this.username +'/things/'+ this.clientId +'/cmd/' + channel;	
	self.listeners[channel] = true;		
	self.MqttClient.subscribe(topic);
	return this;
}
Client.prototype.unsuscribe = function(channel){
	var self = this;
	var topic = 'v1/'+ this.username +'/things/'+ this.clientId +'/cmd/' + channel;	
	delete self.listeners[channel];	
	return this;
}
Client.prototype.publishCallback = function(channel,message,hash){
	var self = this;		   
	self.log('publishCallback()',[channel,message,hash]);
	self.publishChannel(channel,message);
	self.publishSuccess(hash);
	return this;
}
Client.prototype.publishChannel = function(channel,message){
	var self = this;
	self.log('publishChannel()',[channel,message]);
	var topic = self.buildTopicPub(channel);
	self.MqttClient.publish(topic,message);
	return this;	
}
Client.prototype.publishTopic = function(topic,message){
	var self = this;
	self.log('publishTopic()',[topic,message]);
	self.MqttClient.publish(topic,message);	
}	

Client.prototype.publishSuccess = function(hash){
	var self = this;
	self.log('publishSuccess()',[hash]);
	var topic = self.buildTopicRes();
	self.MqttClient.publish(topic,'ok,'+ hash);
}
Client.prototype.publishError = function(msg){
	var self = this;
	self.log('publishError()',[msg]);
	var topic = self.buildTopicRes();
	self.MqttClient.publish(topic,'error,msg='+ msg);
}

Client.prototype.handleMessage = function(topic,message,packet){
	var self = this;
	var msg = message.toString();
	var hash = msg.split(',')[0];
	var state = msg.split(',')[1];
	self.log('handleMessage()',[topic,msg]);
	self.emit('message',state,hash);		
	var channel = topic.split('/').pop();
	if( self.listeners[channel] !== 'undefined' ){		
		self.publishCallback(channel,state,hash);	
	}
	if( self.channnels[channel] !== 'undefined' ){		
		var Channel = self.channnels[channel];
		Channel.handleMessage(state,hash);
	}
}
Client.prototype.Channel = function(ch){
	var self = this;
	var Ch1 = new Channel(self,ch);	
	self.suscribe(ch);
	self.channnels[ch] = Ch1;
	return Ch1;
}
Client.prototype.log = function(type,data){
	if(this.debug){
		console.log(type + ' ' + data.join(','));
	}
}

module.exports = Client;
