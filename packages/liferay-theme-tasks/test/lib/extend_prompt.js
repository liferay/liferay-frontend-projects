'use strict';

var _ = require('lodash');
var chai = require('chai');
var ExtendPrompt = require('../../lib/extend_prompt');
var fs = require('fs-extra');
var lfrThemeConfig = require('../../lib/liferay_theme_config.js');
var os = require('os');
var path = require('path');

var assert = chai.assert;
chai.use(require('chai-fs'));

var tempPath = path.join(os.tmpdir(), 'liferay-theme-tasks', 'base-theme');

var liferayVersion = '7.0';

var liferayThemeThemletMetaData = {
	themelet: true,
	version: liferayVersion
};

var themeletDependencies = {
	'themelet-1': {
		liferayTheme: liferayThemeThemletMetaData,
		name: 'themelet-1',
		realPath: 'path/to/themelet-1',
		version: liferayVersion
	},
	'themelet-2': {
		liferayTheme: liferayThemeThemletMetaData,
		name: 'themelet-2',
		realPath: 'path/to/themelet-2',
		version: liferayVersion
	},
	'themelet-3': {
		liferayTheme: liferayThemeThemletMetaData,
		name: 'themelet-3',
		realPath: 'path/to/themelet-3',
		version: liferayVersion
	}
};

describe('Extend Prompt', function() {
	before(function(done) {
		this.timeout(10000);

		var instance = this;

		instance._initCwd = process.cwd();

		fs.copy(path.join(__dirname, '../fixtures/themes/base-theme'), tempPath, function (err) {
			if (err) throw err;

			process.chdir(tempPath);

			instance._buildPath = path.join(tempPath, 'build');
			instance._tempPath = tempPath;

			done();
		});
	});

	after(function() {
		fs.removeSync(tempPath);

		process.chdir(this._initCwd);
	});

	afterEach(function() {
		ExtendPrompt.prototype._extendableThemes = undefined;
		ExtendPrompt.prototype._extendType = undefined;
	});

	describe('_extendTypeConditional', function() {
		it('should return true if argument matches extendType and extendableThemes is not empty', function(done) {
			var instance = this;

			assert(!ExtendPrompt.prototype._extendTypeConditional('themelet'));

			ExtendPrompt.prototype._extendType = 'themelet';

			assert(!ExtendPrompt.prototype._extendTypeConditional('themelet'));
			assert(!ExtendPrompt.prototype._extendTypeConditional('theme'));

			ExtendPrompt.prototype._extendableThemes = {
				name: 'test'
			};

			assert(ExtendPrompt.prototype._extendTypeConditional('themelet'));
			assert(!ExtendPrompt.prototype._extendTypeConditional('theme'));

			ExtendPrompt.prototype._extendType = 'theme';

			assert(ExtendPrompt.prototype._extendTypeConditional('theme'));

			done();
		});
	});

	describe('_getThemeletDependenciesFromAnswers', function() {
		it('should get themelet dependencies from answers', function(done) {
			ExtendPrompt.prototype._extendableThemes = themeletDependencies;

			assert.isUndefined(ExtendPrompt.prototype._getThemeletDependenciesFromAnswers({
				themeletNames: 'themelet-name'
			}), 'themelet dependencies is not undefined');

			var themeletDependenciesFromAnswers = ExtendPrompt.prototype._getThemeletDependenciesFromAnswers({
				themeletNames: 'themelet-1'
			});

			assert.isObject(themeletDependenciesFromAnswers);

			var themelet1 = themeletDependencies['themelet-1'];
			var themelet1FromAnswers = themeletDependenciesFromAnswers['themelet-1'];

			assert.deepEqual(themelet1FromAnswers.liferayTheme, themelet1.liferayTheme);
			assert.equal(themelet1FromAnswers.name, themelet1.name);
			assert.equal(themelet1FromAnswers.path, themelet1.realPath);
			assert.equal(themelet1FromAnswers.version, themelet1.version);

			assert.isUndefined(themeletDependenciesFromAnswers['themelet-2'], 'themelet 2 is returned');
			assert.isUndefined(themeletDependenciesFromAnswers['themelet-3'], 'themelet 3 is returned');

			done();
		});
	});

	describe('_getUnusedDependencies', function() {
		it('should remove unused dependencies', function(done) {
			lfrThemeConfig.setConfig({
				baseTheme: 'styled'
			});

			assert(_.isEmpty(ExtendPrompt.prototype._getUnusedDependencies({
				baseThemeName: 'styled'
			})));

			var baseThemeName = 'new-base-theme';

			lfrThemeConfig.setConfig({
				baseTheme: {
					name: baseThemeName
				}
			});

			assert.deepEqual(ExtendPrompt.prototype._getUnusedDependencies({
				baseThemeName: 'styled'
			}), [baseThemeName]);

			ExtendPrompt.prototype._themeletChoices = ['themelet-1', 'themelet-2', 'themelet-3'];

			assert.deepEqual(ExtendPrompt.prototype._getUnusedDependencies({
				themeletNames: ['themelet-2']
			}), ['themelet-1', 'themelet-3']);

			done();
		});
	});

	// _normalizeBaseTheme
	describe('_normalizeBaseTheme', function() {
		it('should normalize base theme meta data', function(done) {
			ExtendPrompt.prototype._extendableThemes = {
				name: 'test'
			};

			assert.isUndefined(ExtendPrompt.prototype._normalizeBaseTheme({
				baseThemeName: 'styled'
			}), 'base theme is not undefined');

			assert.equal(ExtendPrompt.prototype._normalizeBaseTheme({
				baseThemeName: 'styled',
				extendType: 'theme'
			}), 'styled', 'base theme is not equal to styled');

			assert.equal(ExtendPrompt.prototype._normalizeBaseTheme({
				baseThemeName: 'unstyled',
				extendType: 'theme'
			}), 'unstyled', 'unstyled');

			assert.isUndefined(ExtendPrompt.prototype._normalizeBaseTheme({
				baseThemeName: 'base-theme-name',
				extendType: 'theme'
			}), 'base theme is not undefined');

			ExtendPrompt.prototype._extendableThemes = {
				'base-theme-name': {
					liferayTheme: {},
					name: 'base-theme-name',
					path: '/path/to/theme',
					version: '7.0.0'
				}
			};

			assert.isObject(ExtendPrompt.prototype._normalizeBaseTheme({
				baseThemeName: 'base-theme-name',
				extendType: 'theme'
			}), 'base theme is not defined');

			done();
		});
	});

	// _getDependencyInstallationArray
	describe('_getDependencyInstallationArray', function() {
		it('should return absolute path if present or name of module', function(done) {
			var dependencies = ExtendPrompt.prototype._getDependencyInstallationArray({
				'themelet-1': {
					liferayTheme: {
						themelet: true,
						version: '*'
					},
					name: 'themelet-1',
					version: '1.0'
				},
				'themelet-2': {
					liferayTheme: {
						themelet: true,
						version: '*'
					},
					name: 'themelet-2',
					path: 'path/to/themelet-2',
					version: '1.0'
				},
				'themelet-3': {
					liferayTheme: {
						themelet: true,
						version: '7.0'
					},
					name: 'themelet-3',
					publishConfig: {
						tag: '7_0_x'
					},
					version: '1.0'
				}
			});

			assert.deepEqual(dependencies, ['themelet-1@*', 'path/to/themelet-2', 'themelet-3@7_0_x']);

			done();
		});
	});

	// _normalizeThemeletDependencies
	describe('_normalizeThemeletDependencies', function() {
		it('should remove unselected themelet dependencies and merge with saved themelet dependencies', function(done) {
			var normalizedThemeletDependencies = ExtendPrompt.prototype._normalizeThemeletDependencies({
				themeSource: 'global'
			});

			assert.isObject(normalizedThemeletDependencies);
			assert.isDefined(normalizedThemeletDependencies['test-themelet']);

			normalizedThemeletDependencies = ExtendPrompt.prototype._normalizeThemeletDependencies({
				themeSource: 'npm'
			});

			assert.isObject(normalizedThemeletDependencies);
			assert.isUndefined(normalizedThemeletDependencies['test-themelet']);

			ExtendPrompt.prototype._extendableThemes = themeletDependencies;

			normalizedThemeletDependencies = ExtendPrompt.prototype._normalizeThemeletDependencies({
				themeletNames: ['themelet-1', 'themelet-2'],
				themeSource: 'npm'
			});

			assert.isDefined(normalizedThemeletDependencies['themelet-1']);
			assert.isDefined(normalizedThemeletDependencies['themelet-2']);
			assert.isUndefined(normalizedThemeletDependencies['test-themelet']);

			normalizedThemeletDependencies = ExtendPrompt.prototype._normalizeThemeletDependencies({
				themeletNames: ['themelet-2'],
				themeSource: 'global'
			});

			assert.isDefined(normalizedThemeletDependencies['test-themelet']);
			assert.isDefined(normalizedThemeletDependencies['themelet-2']);
			assert.isUndefined(normalizedThemeletDependencies['themelet-1']);

			done();
		});
	});
});
