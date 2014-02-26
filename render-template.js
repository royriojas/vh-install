var dir = __dirname,
    fs = require('fs'),
    path = require('path'),
    grunt = require('grunt'),
    dot = require('dot');

dot.templateSettings.strip = false;

module.exports = function renderTemplate(templateFile, data) {  
  var tFile = path.resolve(dir, templateFile),
    templateContent = grunt.file.read(tFile),
    renderer = dot.template(templateContent),
    renderedContent = renderer(data);

  return renderedContent;
};
