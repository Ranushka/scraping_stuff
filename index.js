
var express = require('express');
var app = express();

var Agenda = require('agenda');
var Agendash = require('agendash');

const pm2 = require('pm2');

const mongoConnectionString = 'mongodb://127.0.0.1/agenda';

const agenda = new Agenda({
  db: {
    address: mongoConnectionString
  }
});


agenda.define('lomge', function (job, done) {
  console.log('test');
  done();
});

// var awok = require('./jobs/awok_products.js');
// awok(agenda);

app.use('/dash', Agendash(agenda));
app.listen(3031, () => console.log('Example app listening on port 3031!'));


agenda.define('lomge', function (job, done) {
  console.log('test');

    pm2.connect(function (err) {
      if (err) {
        console.error(err)
        process.exit(2)
      }

      // each
      pm2.start({
        script: './jobs/mumzworld_products.js',
        instances: 6,
        autorestart: false
      }, (err, apps) => {
        pm2.disconnect()
        if (err) {
          throw err
        }
      });
    })

    done();

});

agenda.on('ready', function () {
  agenda.every('10 minutes', 'lomge');
  agenda.start();
});



