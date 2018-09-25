'use strict';

const debug = require('debug')('mk:lifx-lan-alerts:mqtt');
const MQTT = require('mqtt');
const events = require('events');
const eventEmitter = new events.EventEmitter();
const config = require('../config.json');

module.exports = {
  register,
};

const { username, password, url, topic } = config.mqtt;
let mqttOptions = {};

if (username && password) {
  mqttOptions = {
    username,
    password,
  };
}

debug('Creating client for ..', url);
const client = MQTT.connect(url, mqttOptions);

client.on('connect', () => {
  debug('MQTT_CLIENT_CONNECTED');
});

client.subscribe(topic, () => {
  client.on('message', (topic, message) => {
    console.log(topic, message.toString());
    eventEmitter.emit('MQTT_MESSAGE', topic, message.toString());
  });
});

client.on('error', (error) => {
  console.log('MQTT_ERROR', error);
});

function register(cb) {
  eventEmitter.on('MQTT_MESSAGE', cb);
}
