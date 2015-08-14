var path = require( 'path' );

// @breck7
// https://github.com/breck7

//TODO make it expand ~ on any of the arguments
module.exports = function resolvePath( string ) {
  if ( string.substr( 0, 1 ) === '~' ) {
    string = process.env.HOME + string.substr( 1 );
  }
  return path.resolve( string );
};
