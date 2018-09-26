'use strict';

const debug = require('debug')('mk:lifx-lan-alerts:index');
const lifx = require('node-lifx-lan');
const mqtt = require('./lib/mqtt');

let config;

try {
  config = require('./config.json');
} catch(err) {
  console.error('NO_CONFIG_FOUND');
  process.exit(1);
}

const ON_COLOR = config.onColor;
const filters = [{
  label: config.lampName,
}];

let previousColorState = {};
let previousPowerState = false;

mqtt.register(handleMessage);

function handleMessage(topic, isAlerting) {
  if (isAlerting === 'true') {
    return turnOn();
  }

  turnOff();
}

function turnOn() {
  debug('Turning alerting lamp on..');

  checkForTimes()
    .then(() => lifx.discover())
    .then(checkForDevices)
    .then(savePreviousState)
    .then(() => {
      return lifx.turnOnFilter({
        filters,
        color: { css: ON_COLOR },
      });
    })
    .catch(console.error);
}

function turnOff() {
  debug('Turning alerting lamp off..');

  lifx.discover()
    .then(checkForDevices)
    .then(() => {
      if (previousPowerState && previousColorState) {
        return lifx.setColorFilter({
          filters,
          color: previousColorState,
        });
      }

      return lifx.turnOffFilter({
        filters,
      });
    })
    .catch(console.error);
}

function checkForDevices(devices) {
  if (!devices || devices.length === 0) {
    throw new Error('NO_DEVICES_FOUND');
  }

  return devices;
}

function savePreviousState(devices) {
  const alertDevice = devices.find((device) => {
    return device.deviceInfo.label === config.lampName;
  });

  if (!alertDevice) {
    throw new Error('NO_MATCHING_LAMP_FOUND');
  }

  return alertDevice.getLightState()
    .then((state) => {
      previousColorState = state && state.color;
      debug('PREVIOUS_COLOR', previousColorState);
      previousPowerState = state.power;
      debug('PREVIOUS_POWER', previousPowerState);
    });
}

function checkForTimes() {
  return new Promise((resolve, reject) => {
    const start = config.quietHourStartTime;
    const end = config.quietHourEndTime;
    const now = new Date();
    const nowHour = now.getHours();
    const isWithinHours = nowHour > start && nowHour < end;

    if (isWithinHours) {
      return reject(new Error('QUIET_HOURS'));
    }

    resolve();
  });
}