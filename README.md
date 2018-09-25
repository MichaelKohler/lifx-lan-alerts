Lifx Alert from MQTT
=====

This tool sets the Lifx Bulb to "red" if an alarm comes in through MQTT.

Setup
-----

Copy the sample configuration file and adjust it:

```
$ cp config.sample.json config.json
```

Install the dependencies:

```
$ npm install
```

Running locally
-----

```
$ DEBUG=mk:* npm start
```

Run in production
-----

```
$ npm install
$ npm start
```