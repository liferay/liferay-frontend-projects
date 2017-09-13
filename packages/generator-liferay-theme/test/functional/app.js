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

describe('liferay-theme:app functional tests', function () {
	it('creates files', function(done) {
		runGenerator(null, function() {
			assert.file([
				'gulpfile.js',
				'package.json',
				'src/css/_custom.scss',
				'src/WEB-INF/liferay-plugin-package.properties'
			]);

			done();
		});
	});

	it('populates 7.0 package.json correctly', function(done) {
		var themeId = 'test-theme';

		runGenerator({
			themeId: themeId
		}, function() {
			var pkg = getPackage(themeId);

			assert.equal(pkg.liferayTheme.rubySass, false);
			assert.equal(pkg.liferayTheme.templateLanguage, 'ftl');
			assert.equal(pkg.liferayTheme.version, '7.0');
			assert.equal(pkg.name, 'test-theme');
			assert.equal(pkg.version, '1.0.0');

			var tempThemeDir = path.join(tempDir, themeId);

			var pathLookAndFeel = path.join(tempThemeDir, 'src/WEB-INF/liferay-look-and-feel.xml');

			assert.fileContent(pathLookAndFeel, '<version>7.0.0+</version>');
			assert.fileContent(pathLookAndFeel, '<theme id="test-theme" name="Test Theme">');
			assert.fileContent(pathLookAndFeel, '<template-extension>ftl</template-extension>');
			assert.fileContent(pathLookAndFeel, '<!DOCTYPE look-and-feel PUBLIC "-//Liferay//DTD Look and Feel 7.0.0//EN" "http://www.liferay.com/dtd/liferay-look-and-feel_7_0_0.dtd">');

			done();
		});
	});

	it('populate 7.0 liferay-plugin-package.properties correctly', function(done) {
		var themeId = 'test-theme';

		runGenerator({
			themeId: themeId
		}, function() {
			var tempThemeDir = path.join(tempDir, themeId);

			var pathLiferayPluginPackageProperties = path.join(tempThemeDir, 'src/WEB-INF/liferay-plugin-package.properties');

			assert.fileContent(pathLiferayPluginPackageProperties, 'liferay-versions=7.0.0+');
			assert.fileContent(pathLiferayPluginPackageProperties, 'name=Test Theme');
			chaiAssert.notFileContentMatch(pathLiferayPluginPackageProperties, /required-deployment-contexts=\\\n#\s+resources-importer-web/);

			done();
		});
	});

	it('populates 6.2 package.json correctly', function(done) {
		var themeId = '62-theme';

		runGenerator({
			liferayVersion: '6.2',
			templateLanguage: 'ftl',
			themeId: themeId
		}, function() {
			var pkg = getPackage(themeId);

			assert.equal(pkg.liferayTheme.rubySass, true);
			assert.equal(pkg.liferayTheme.templateLanguage, 'ftl');
			assert.equal(pkg.liferayTheme.version, '6.2');
			assert.equal(pkg.version, '0.0.0');

			var tempThemeDir = path.join(tempDir, themeId);

			var pathLookAndFeel = path.join(tempThemeDir, 'src/WEB-INF/liferay-look-and-feel.xml');

			assert.fileContent(pathLookAndFeel, '<version>6.2.0+</version>');
			assert.fileContent(pathLookAndFeel, '<theme id="62-theme" name="Test Theme">');
			assert.fileContent(pathLookAndFeel, '<template-extension>ftl</template-extension>');
			assert.fileContent(pathLookAndFeel, '<!DOCTYPE look-and-feel PUBLIC "-//Liferay//DTD Look and Feel 6.2.0//EN" "http://www.liferay.com/dtd/liferay-look-and-feel_6_2_0.dtd">');

			done();
		});
	});

	it('populate 6.2 liferay-plugin-package.properties correctly', function(done) {
		var themeId = 'test-theme';

		runGenerator({
			liferayVersion: '6.2',
			templateLanguage: 'ftl',
			themeId: themeId
		}, function() {
			var tempThemeDir = path.join(tempDir, themeId);

			var pathLiferayPluginPackageProperties = path.join(tempThemeDir, 'src/WEB-INF/liferay-plugin-package.properties');

			assert.fileContent(pathLiferayPluginPackageProperties, 'liferay-versions=6.2.0+');
			assert.fileContent(pathLiferayPluginPackageProperties, 'name=Test Theme');
			chaiAssert.fileContentMatch(pathLiferayPluginPackageProperties, /required-deployment-contexts=\\\n#\s+resources-importer-web/);

			done();
		});
	});

	it('tests themeDirName configuration', function(done) {
		runGenerator({
			themeId: 'test'
		}, function() {
			var pkg = getPackage('test-theme');

			chaiAssert.equal(pkg.name, 'test-theme');

			done();
		});
	});
});

function getPackage(themeId) {
	var fileContents = fs.readFileSync(path.join(tempDir, themeId, 'package.json'));

	return JSON.parse(fileContents);
}

function runGenerator(options, end) {
	options = options || {};

	options = _.defaults(options, {
		liferayVersion: '7.0',
		templateLanguage: 'vm',
		themeName: 'Test Theme'
	});

	delete require.cache[path.join(__dirname, '../../generators/app/index.js')];

	helpers.run(path.join(__dirname, '../../generators/app'))
		.inDir(tempDir)
		.withOptions({
			'skip-install': true
		})
		.withPrompt(options)
		.on('end', end);
}
