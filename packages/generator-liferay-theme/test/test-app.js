'use strict';

var path = require('path');
var assert = require('yeoman-generator').assert;
var helpers = require('yeoman-generator').test;
var os = require('os');

describe('liferay-theme:app', function () {
  before(function (done) {
    helpers.run(path.join(__dirname, '../app'))
      .inDir(path.join(os.tmpdir(), './temp-test'))
      .withOptions({ 'skip-install': true })
      .withPrompt({
        themeName: 'test-theme',
        themeId: 'test-theme',
        supportCompass: false
      })
      .on('end', done);
  });

  it('creates files', function () {
    assert.file([
      'bower.json',
      'gulpfile.js',
      'package.json',
      'src/css/custom.css',
      'src/META-INF/context.xml',
      'src/WEB-INF/liferay-plugin-package.properties',
      'src/WEB-INF/src/resources-importer/readme.txt',
      'src/WEB-INF/src/resources-importer/sitemap.json'
    ]);
  });
});
