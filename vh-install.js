#!/usr/bin/env node

var lib = require('./lib.js'),
  prompt = require('prompt'),
  resolvePath = require('./resolve-path'),
  appendToFile = require('./append-to-file'),
  async = require('async'),
  grunt = require('grunt'),
  argv = prompt.override = require('optimist')
    .alias('d', 'documentRoot')
    .alias('ssl-key', 'sslServerKeyFile')
    .alias('ssl-cert', 'sslCertificateFile')
    .alias('h', 'host')
    .argv;

prompt.start();

var props = {
  host: {
    description: "Hostname?",
    required: true
  },
  documentRoot: {
    description: "Document root?",
    required : true
  }
};

if (argv.ssl) {
  lib.extend(props, {
    sslCertificateFile : {
      description : "SSL Certificate File?",
      required: true
    },
    sslServerKeyFile : {
      description : "SSL Server Key File?",
      required: true
    }
  });
}

prompt.get({
  properties: props
}, function(err, result) {
  if (err) {
    throw err;
  }
  var host = result.host || argv.h;
  var documentRoot = resolvePath(result.documentRoot);

  if (!grunt.file.exists(documentRoot)) {
    throw new Error(lib.format("documentRoot does not exists: {0}", documentRoot));
  }

  var cfg = {
    serverName: host,
    documentRoot: documentRoot,
    errorLog: lib.format("/var/log/apache2/{0}_error.log", host),
    accessLog: lib.format("/var/log/apache2/{0}_access.log", host),
    hosts : [{
      ip : '127.0.0.1',
      host : host
    }]
  };

  if (argv.ssl) {
    var sslServerKeyFile = resolvePath(result.sslServerKeyFile),
      sslCertificateFile = resolvePath(result.sslCertificateFile);

    if (!grunt.file.exists(sslServerKeyFile)) {
      throw new Error(lib.format("sslServerKeyFile does not exists: {0}", sslServerKeyFile));
    }

    if (!grunt.file.exists(sslCertificateFile)) {
      throw new Error(lib.format("sslCertificateFile does not exists: {0}", sslCertificateFile));
    }

    lib.extend(cfg, {
      sslServerKeyFile : sslServerKeyFile,
      sslCertificateFile : sslCertificateFile
    });
  }


  var tasks = [];

  if (argv.ssl) {
    tasks.push(appendToFile('/etc/apache2/extra/httpd-ssl.conf', './templates/vhost-ssl.tpl', cfg));
  }

  tasks.push(appendToFile('/etc/apache2/extra/httpd-vhosts.conf', './templates/vhost.tpl', cfg));
  tasks.push(appendToFile('/etc/hosts', './templates/host.tpl', cfg));

  async.parallel(
    tasks,
    function() {
      console.log('done!');
    }
  );
});
