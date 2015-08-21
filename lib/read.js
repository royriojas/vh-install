module.exports = function read( file ) {
  return require( 'fs' ).readFileSync( file, { encoding: 'utf8' } );
};
