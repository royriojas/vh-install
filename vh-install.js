#!/usr/bin/env node

var lib = require('./lib.js'),
  dot = require('dot'),
  prompt = require('prompt'),
  argv = prompt.override = require('optimist')
    .alias('d', 'documentRoot')
    .alias('cfg', 'config')
    .alias('h', 'host')
    .argv,
  path = require('path'),
  fs = require('fs'),
  grunt = require('grunt'),
  async = require('async'),
  dir = __dirname;

dot.templateSettings.strip = false;


// @breck7   
// https://github.com/breck7

function resolvePath(string) {
  if (string.substr(0, 1) === '~')
    string = process.env.HOME + string.substr(1)
  return path.resolve(string)
}

function makeBackup(file) {
  var bk = file + '_bk_' + Date.now();
  fs.createReadStream(file).pipe(fs.createWriteStream(bk));
}

prompt.start();

var documentRoot = argv.d || process.cwd();

prompt.get({
  properties: {
    host: {
      description: argv.h ? lib.format("Hostname ({0})?", argv.h) : "Hostname?",
      required: !argv.h
    },
    documentRoot: {
      description: lib.format("Document root ({0})?", documentRoot)
    }
  }
}, function(err, result) {
  if (err) {
    throw err;
  }
  var host = result.host || argv.h;
  var cfg = {
    "serverName": host,
    "documentRoot": resolvePath(result.documentRoot || documentRoot),
    "errorLog": lib.format("/var/log/apache2/{0}_error.log", host),
    "accessLog": lib.format("/var/log/apache2/{0}_access.log", host),
    "hosts" : [{
      "ip" : '127.0.0.1',
      "host" : host
    }]
  };

  var vhostFile = '/etc/apache2/extra/httpd-vhosts.conf';
  makeBackup(vhostFile);

  var hostFile = '/etc/hosts';
  makeBackup(hostFile);

  var vHostTpl = path.resolve(dir, './templates/vhost.tpl');
  var hostTpl = path.resolve(dir, './templates/host.tpl');
  var fContent = grunt.file.read(vHostTpl);
  var hContent = grunt.file.read(hostTpl);
  var vHostRenderer = dot.template(fContent);
  var hostRendered = dot.template(hContent);

  var vOContent = vHostRenderer(cfg);
  var oContent = hostRendered(cfg);

  async.parallel(
    [
      function(cb) {
        fs.appendFile(vhostFile, vOContent, function(err) {
          if (err) {
            throw err;
          }
          cb && cb();
        });
      },
      function(cb) {
        fs.appendFile(hostFile, oContent, function(err) {
          if (err) {
            throw err;
          }
        });
      }
    ],
    function() {
      console.log('done!');
    }
  );
});
