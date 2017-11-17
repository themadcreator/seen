/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const express = require('express');
const path    = require('path');
const fs      = require('fs');
const options = require('../../site/options');

const app = express();

app.configure(function() {
  app.engine('html', require('swig').renderFile);
  app.set('view engine', 'html');
  app.set('views', path.join(__dirname));

  app.use('/lib', express.static(path.join(__dirname, '..' , '..', 'dist', 'latest')));

  return app.get('/', (req,res) =>
    res.render('template', {
      scripts : [
        'lib/seen.min.js',
        options.cdns.lodash.script,
        options.cdns.jquery.script
      ],
      width  : 800,
      height : 800,
      ready  : String(require('./dev'))
    })
);});

var server = app.listen(5050, () => console.log('Listening on port %d', server.address().port));

process.once('SIGUSR2', function() {
  console.log('Received SIGUSR2, closing server');
  server.close();
  return setTimeout((() => process.kill(process.pid, 'SIGUSR2')), 1000);
});
