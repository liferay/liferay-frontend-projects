'use strict';

var _ = require('lodash');
var assert = require('yeoman-generator').assert;
var chai = require('chai');
var fs = require('fs');
var helpers = require('yeoman-generator').test;
var os = require('os');
var path = require('path');

var chaiAssert = chai.assert;
chai.use(require('chai-fs'));

var tempDir = path.join(os.tmpdir(), 'temp-test');

var tempThemeDir = path.join(tempDir, 'test-theme');

var pathLiferayPluginPackageProperties = path.join(tempThemeDir, 'src/WEB-INF/liferay-plugin-package.properties');

var pathLookAndFeel = path.join(tempThemeDir, 'src/WEB-INF/liferay-look-and-feel.xml');

describe('liferay-theme:app functional tests', function () {
	it('creates files', function(done) {
		runGenerator(null, function() {
			assert.file([
				'gulpfile.js',
				'package.json',
				'src/css/_custom.scss',
				'src/META-INF/context.xml',
				'src/WEB-INF/liferay-plugin-package.properties',
				'src/WEB-INF/src/resources-importer/readme.txt',
				'src/WEB-INF/src/resources-importer/sitemap.json'
			]);

			done();
		});
	});

	it('populates 7.0 package.json correctly', function(done) {
		runGenerator(null, function() {
			var pkg = getPackage();

			assert.equal(pkg.liferayTheme.supportCompass, false);
			assert.equal(pkg.liferayTheme.templateLanguage, 'vm');
			assert.equal(pkg.liferayTheme.version, '7.0');
			assert.equal(pkg.name, 'test-theme');
			assert.equal(pkg.publishConfig.tag, '7_0_x');
			assert.equal(pkg.version, '1.0.0');

			assert.fileContent(pathLookAndFeel, '<version>7.0.0+</version>');
			assert.fileContent(pathLookAndFeel, '<theme id="test-theme" name="Test Theme">');
			assert.fileContent(pathLookAndFeel, '<template-extension>vm</template-extension>');
			assert.fileContent(pathLookAndFeel, '<!DOCTYPE look-and-feel PUBLIC "-//Liferay//DTD Look and Feel 7.0.0//EN" "http://www.liferay.com/dtd/liferay-look-and-feel_7_0_0.dtd">');

			assert.fileContent(pathLiferayPluginPackageProperties, 'name=Test Theme');
			assert.fileContent(pathLiferayPluginPackageProperties, 'liferay-versions=7.0.0+');

			done();
		});
	});

	it('populates 6.2 package.json correctly', function(done) {
		runGenerator({
			liferayVersion: '6.2',
			supportCompass: true,
			templateLanguage: 'ftl',
		}, function() {
			var pkg = getPackage();

			assert.equal(pkg.liferayTheme.supportCompass, true);
			assert.equal(pkg.liferayTheme.templateLanguage, 'ftl');
			assert.equal(pkg.liferayTheme.version, '6.2');
			assert.equal(pkg.publishConfig.tag, '6_2_x');
			assert.equal(pkg.version, '0.0.0');

			assert.fileContent(pathLookAndFeel, '<version>6.2.0+</version>');
			assert.fileContent(pathLookAndFeel, '<theme id="test-theme" name="Test Theme">');
			assert.fileContent(pathLookAndFeel, '<template-extension>ftl</template-extension>');
			assert.fileContent(pathLookAndFeel, '<!DOCTYPE look-and-feel PUBLIC "-//Liferay//DTD Look and Feel 6.2.0//EN" "http://www.liferay.com/dtd/liferay-look-and-feel_6_2_0.dtd">');

			assert.fileContent(pathLiferayPluginPackageProperties, 'name=Test Theme');
			assert.fileContent(pathLiferayPluginPackageProperties, 'liferay-versions=6.2.0+');

			done();
		});
	});
});

function getPackage(themeName) {
	var fileContents = fs.readFileSync(path.join(tempThemeDir, 'package.json'));

	return JSON.parse(fileContents);
}

function runGenerator(options, end) {
	options = options || {};

	options = _.defaults(options, {
		liferayVersion: '7.0',
		supportCompass: false,
		templateLanguage: 'vm',
		themeId: 'test-theme',
		themeName: 'Test Theme'
	});

	helpers.run(path.join(__dirname, '../../generators/app'))
		.inDir(tempDir)
		.withOptions({
			'skip-install': true
		})
		.withPrompt(options)
		.on('end', end);
}
