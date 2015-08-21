var dir = __dirname;

var path = require( 'path' ),
  dot = require( 'dot' );

dot.templateSettings.strip = false;

var read = require( './read' );

module.exports = function renderTemplate( templateFile, data ) {
  var tFile = path.resolve( dir, templateFile ),
    templateContent = read( tFile ),
    renderer = dot.template( templateContent ),
    renderedContent = renderer( data );

  return renderedContent;
};
