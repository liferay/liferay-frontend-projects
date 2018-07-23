const _ = require('lodash');
const chai = require('chai');
const chalk = require('chalk');
const fs = require('fs');
const os = require('os');
const path = require('path');
const sinon = require('sinon');
const helpers = require('yeoman-generator').test;

chai.use(require('chai-fs'));
const assert = chai.assert;
const sinonAssert = sinon.assert;

const liferayThemeImport = require('../index');
const tempDir = path.join(os.tmpdir(), 'temp-test');
const tempThemeDir = path.join(tempDir, 'sdk-theme');
const pathSdkTheme = path.join(__dirname, './fixtures/sdk-theme');

describe('liferay-theme:import unit tests', function() {
	var prototype;

	beforeEach(function() {
		prototype = _.create(liferayThemeImport.prototype);
	});

	describe('_getSettingFromConfigFile', function() {
		it('should output a specific string if certain conditions are met', function() {
			var config = {};
			var expectedOutput = chalk.yellow('   Warning ') + '%s not found';

			config.filePath = 'path';

			prototype.importTheme = 'theme';
			prototype.log = sinon.spy();

			prototype._getSettingFromConfigFile(config);

			sinonAssert.calledWith(prototype.log.getCall(0), expectedOutput);
		});
	});

	describe('_validatePath', function() {
		it('should pass', function() {
			var retVal = prototype._validatePath('/does/not/exist');

			assert.equal(retVal, '"/does/not/exist" does not exist');

			retVal = prototype._validatePath(
				path.join(
					__dirname,
					'./__fixtures__/sdk-theme/docroot/WEB-INF/liferay-look-and-feel.xml'
				)
			);

			assert.match(
				retVal,
				/liferay-look-and-feel\.xml" is not a directory/,
				'return value should match'
			);

			retVal = prototype._validatePath(
				path.join(__dirname, './__fixtures__/sdk-theme/docroot')
			);

			assert.match(
				retVal,
				/sdk-theme\/docroot" doesn't appear to be a theme in the SDK/,
				'return value should match'
			);

			retVal = prototype._validatePath(
				path.join(__dirname, './__fixtures__/sdk-theme')
			);

			assert(retVal, 'returns true');
		});
	});
});

// TODO: fix functional tests
// describe('liferay-theme:import functional tests', function() {
// 	it('creates files', function(done) {
// 		runGenerator(null, function() {
// 			assert.file([
// 				'gulpfile.js',
// 				'package.json',
// 				'src/css/custom.css',
// 				'src/templates/portal_normal.vm',
// 				'src/WEB-INF/liferay-look-and-feel.xml',
// 				'src/WEB-INF/liferay-plugin-package.properties',
// 				'src/WEB-INF/liferay-releng.properties',
// 			]);
//
// 			done();
// 		});
// 	});
//
// 	it('populates 6.2 package.json correctly', function(done) {
// 		runGenerator(null, function() {
// 			var pkg = getPackage();
//
// 			assert.equal(pkg.liferayTheme.rubySass, true);
// 			assert.equal(pkg.liferayTheme.templateLanguage, 'vm');
// 			assert.equal(pkg.liferayTheme.version, '6.2');
// 			assert.equal(pkg.version, '1.0.0');
//
// 			done();
// 		});
// 	});
// });
//
// function getPackage(themeName) {
// 	var fileContents = fs.readFileSync(path.join(tempThemeDir, 'package.json'));
//
// 	return JSON.parse(fileContents);
// }
//
// function runGenerator(options, end) {
// 	options = options || {};
//
// 	options = _.defaults(options, {
// 		importTheme: pathSdkTheme,
// 	});
//
// 	delete require.cache[path.join(__dirname, '../../index.js')];
//
// 	helpers
// 		.run(path.join(__dirname, '../../index.js'))
// 		.inDir(tempDir)
// 		.withOptions({
// 			'skip-install': true,
// 		})
// 		.withPrompt(options)
// 		.on('end', end);
// }
