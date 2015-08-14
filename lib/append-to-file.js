var dir = __dirname;

var fs = require( 'fs' ),
  path = require( 'path' ),
  grunt = require( 'grunt' ),
  dot = require( 'dot' );

dot.templateSettings.strip = false;

function makeBackup( file ) {
  var bk = file + '_bk_' + Date.now();
  fs.createReadStream( file ).pipe( fs.createWriteStream( bk ) );
}

module.exports = function appendToFile( fileToAppend, templateFile, data, doNotWrite ) {
  return function ( cb ) {
    var tFile = path.resolve( dir, templateFile ),
      templateContent = grunt.file.read( tFile ),
      renderer = dot.template( templateContent ),
      renderedContent = renderer( data );

    if ( doNotWrite ) {
      console.log( 'the file %s will have the following append to it: \n\n %s', fileToAppend, renderedContent );
      cb && cb();
      return;
    }
    makeBackup( fileToAppend );
    fs.appendFile( fileToAppend, renderedContent, function ( err ) {
      if ( err ) {
        throw err;
      }
      cb && cb();
    } );
  };
};
