var dir = __dirname,
    fs = require('fs'),
    path = require('path'),
    grunt = require('grunt'),
    dot = require('dot');

dot.templateSettings.strip = false;

function makeBackup(file) {
  var bk = file + '_bk_' + Date.now();
  fs.createReadStream(file).pipe(fs.createWriteStream(bk));
}

module.exports = function appendToFile(fileToAppend, templateFile, data) {
  return function(cb) {
    var templateFile = path.resolve(dir, templateFile),
        templateContent = grunt.file.read(templateFile),
        renderer = dot.template(templateContent),
        renderedContent = renderer(data);
    makeBackup(fileToAppend);
    fs.appendFile(fileToAppend, renderedContent, function(err) {
      if (err) {
        throw err;
      }
      cb && cb();
    });
  }
};
