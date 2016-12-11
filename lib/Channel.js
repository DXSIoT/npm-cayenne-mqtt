
/*
 * Cayenne Channel
 */
 
var events = require('events');
var util = require('util');

var Channel = function (Client,channel){  
  this.Client = Client;
  this.channel = channel;

  this.topicPub = Client.buildTopicPub(channel);
  this.topicSub = Client.buildTopicSub(channel);
  this.topicRes = Client.buildTopicRes(channel);  
  return this;
}
util.inherits(Channel, events.EventEmitter);

Channel.prototype.handleMessage = function(state,hash){
  this.log('handleMessage',[state]);
  this.emit('message',state,hash);
  return this;
}
Channel.prototype.publish = function(msg){  
  this.Client.publishTopic(this.topicPub,msg);
  return this;
}
Channel.prototype.log = function(type,data){
  return this.Client.log(type,data);  
}

module.exports = Channel;