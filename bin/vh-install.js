#!/usr/bin/env node

var fs = require( 'fs' );
var console = require( 'clix-logger/logger' );

var extend = require( 'extend' );

var prompt = require( 'prompt' ),
  resolvePath = require( '../lib/resolve-path' ),
  renderTemplate = require( '../lib/render-template' ),
  appendToFile = require( '../lib/append-to-file' );

var async = require( 'async' );

var argv = prompt.override = require( 'yargs' )
  .alias( 'd', 'documentRoot' )
  .alias( 'ssl-key', 'sslServerKeyFile' )
  .alias( 'ssl-cert', 'sslCertificateFile' )
  .alias( 'h', 'host' )
  .argv;

var format = require( 'stringformat' );

var write = require( 'write' ).sync;

function start() {

  var platform = require( 'os' ).platform();
  var platformLinux = platform === 'linux';

  var supported = { linux: true, darwin: true };

  var isSupported = !!supported[ platform ];

  if ( !isSupported ) {
    throw new Error( 'Platform not supported. ' + platform );
  }

  var dryRun = process.argv.indexOf( '--dry-run' ) > -1;

  prompt.start();

  var props = {
    host: {
      description: 'Hostname?',
      required: true
    },
    documentRoot: {
      description: 'Document root?',
      required: true
    }
  };

  if ( argv.ssl && !platformLinux ) {
    extend( props, {
      sslCertificateFile: {
        description: 'SSL Certificate File?',
        required: true
      },
      sslServerKeyFile: {
        description: 'SSL Server Key File?',
        required: true
      }
    } );
  }

  prompt.get( { properties: props }, function ( err, result ) {
    if ( err ) {
      throw err;
    }
    var host = result.host || argv.h;
    var documentRoot = resolvePath( result.documentRoot );

    if ( !fs.existsSync( documentRoot ) ) {
      throw new Error( format( 'documentRoot does not exists: {0}', documentRoot ) );
    }

    var cfg = {
      serverName: host,
      documentRoot: documentRoot,
      errorLog: format( '/var/log/apache2/{0}_error.log', host.replace( /\./g, '_' ) ),
      accessLog: format( '/var/log/apache2/{0}_access.log', host.replace( /\./g, '_' ) ),
      hosts: [
        {
          ip: '127.0.0.1',
          host: host
        }
      ]
    };

    if ( argv.ssl && !platformLinux ) {
      var sslServerKeyFile = resolvePath( result.sslServerKeyFile ),
        sslCertificateFile = resolvePath( result.sslCertificateFile );

      if ( !fs.existsSync( sslServerKeyFile ) ) {
        throw new Error( format( 'sslServerKeyFile does not exists: {0}', sslServerKeyFile ) );
      }

      if ( !fs.existsSync( sslCertificateFile ) ) {
        throw new Error( format( 'sslCertificateFile does not exists: {0}', sslCertificateFile ) );
      }

      extend( cfg, {
        sslServerKeyFile: sslServerKeyFile,
        sslCertificateFile: sslCertificateFile
      } );
    }

    var tasks = [ ];

    if ( argv.ssl && !platformLinux ) {
      tasks.push( appendToFile( '/etc/apache2/extra/httpd-ssl.conf', '../templates/vhost-ssl.tpl', cfg, dryRun ) );
    }

    if ( !platformLinux ) {
      tasks.push( appendToFile( '/etc/apache2/extra/httpd-vhosts.conf', '../templates/vhost.tpl', cfg, dryRun ) );
    } else {
      tasks.push( function ( cb ) {
        var content = renderTemplate( '../templates/vhost.tpl', cfg, dryRun );
        var filePath = '/etc/apache2/sites-available/' + cfg.serverName;

        if ( dryRun ) {
          console.log( 'the file %s will be created with the following content: \n\n%s', filePath, content );

          cb && cb();
          return;
        }
        write( filePath, content );
        cb && cb();
      } );
    }

    tasks.push( appendToFile( '/etc/hosts', '../templates/host.tpl', cfg, dryRun ) );

    async.parallel(
      tasks, function () {
        console.log( 'Enabling %s', cfg.serverName );

        var cmd = platformLinux ? 'sudo a2ensite ' + cfg.serverName + ' && sudo service apache2 restart'
          : 'sudo apachectl restart';

        if ( dryRun ) {
          console.log( 'the following command would have being executed: %s', cmd );
          return;
        }

        var cp = require( 'child_process' );
        cp.exec( cmd, function ( _err /*, stdout, stderr*/ ) {
          if ( _err ) {
            throw _err;
          }
          console.log( 'the site %s was enabled', cfg.serverName );
          console.log( 'All done!' );
        } );
      }
    );
  } );
}

//process.on('close', )

var d = require( 'domain' ).create();
d.on( 'error', function ( err ) {
  console.print();
  if ( process.argv.indexOf( '--stack' ) > -1 ) {
    console.error( err.message, err.stack );
  } else {
    console.error( err.message );
  }
  process.exit( 1 ); //eslint-disable-line
} );

d.run( start );
