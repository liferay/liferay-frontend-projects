'use strict';

var _ = require('lodash');
var chai = require('chai');
var fs = require('fs-extra');
var parseString = require('xml2js').parseString;
var path = require('path');
var sinon = require('sinon');

var testUtil = require('../../util');

var assert = chai.assert;
chai.use(require('chai-fs'));

var buildPath;
var tempPath;
var themeConfig;
var version;

var helper = {};

_.assign(helper, {
	testBoilerplate: function(test, config, cb) {
		var initCwd = process.cwd();

		var hookFn = config.hookFn;
		var namespace = config.namespace;
		var rubySass = config.rubySass || false;
		var themeName = config.themeName;
		version = config.version;

		var sassOptionsSpy = sinon.spy();

		test.cb.before(function(t) {
			testUtil.cleanTempTheme(themeName, version, namespace);

			testUtil.copyTempTheme({
				namespace: namespace,
				registerTasksOptions: {
					sassOptions: function(defaults) {
						sassOptionsSpy();

						if (rubySass) {
							assert(defaults.compass, 'assert default sassOptions');
							assert(defaults.loadPath, 'assert default sassOptions');
						}
						else {
							assert(defaults.includePaths, 'assert default sassOptions');
						}

						return defaults;
					},
					hookFn: hookFn,
					rubySass: rubySass
				},
				themeConfig: {
					rubySass: rubySass
				},
				themeName: themeName,
				version: version
			}, function(config) {
				tempPath = config.tempPath;

				buildPath = path.join(tempPath, config.registerTasksOptions.pathBuild);

				var lfrThemeConfig = require('../../../lib/liferay_theme_config');

				themeConfig = lfrThemeConfig.getConfig();

				cb(config);

				t.end();
			});
		});

		test.after(function(t) {
			t.true(sassOptionsSpy.calledOnce);

			process.chdir(initCwd);
		});
	},

	buildHookFn: function(gulp) {
		gulp.hook('after:build:base', helper._assertBase);
		gulp.hook('after:build:clean', helper._assertClean);
		gulp.hook('after:build:compile-css', helper._assertCompileCss);
		gulp.hook('after:build:hook', helper._assertHook);
		gulp.hook('after:build:move-compiled-css', helper._assertMoveCompiledCss);
		gulp.hook('after:build:remove-old-css-dir', helper._assertRemoveOldCssDir);
		gulp.hook('after:build:rename-css-dir', helper._assertRenameCssDir);
		gulp.hook('after:build:src', helper._assertSrc);
		gulp.hook('after:build:themelets', helper._assertThemelets);
		gulp.hook('after:build:web-inf', helper._assertWebInf);
		gulp.hook('after:plugin:war', helper._assertWar);
		gulp.hook('before:build', helper._assertBeforeBuild);
	},

	_assertBase: function(cb) {
		assert.isDirectory(buildPath);

		cb();
	},

	_assertBeforeBuild: function(cb) {
		var distPath = path.join(tempPath, 'dist');

		assert.isDirectory(path.join(tempPath, 'custom_src_path'));

		assert.throws(function() {
			fs.statSync(buildPath);
		});
		assert.throws(function() {
			fs.statSync(distPath);
		});

		cb();
	},

	_assertClean: function(cb) {
		if (fs.existsSync(buildPath)) {
			throw new Error('Build path should not exist');
		}

		cb();
	},

	_assertCompileCss: function(cb) {
		cb();
	},

	_assertHook: function(cb) {
		var hookPath = path.join(buildPath, 'WEB-INF', 'liferay-hook.xml.processed');

		assert.isFile(hookPath);

		var liferayHookXML = fs.readFileSync(hookPath, {
			encoding: 'utf8'
		});

		parseString(liferayHookXML, function(err, result) {
			if (err) throw err;

			assert.deepEqual(
				['content/Language_en.properties', 'content/Language_es.properties'],
				result.hook['language-properties']
			);

			cb();
		});
	},

	_assertMoveCompiledCss: function(cb) {
		assert.isDirectory(path.join(buildPath, 'css'));

		cb();
	},

	_assertRemoveOldCssDir: function(cb) {
		if (fs.existsSync(path.join(buildPath, '_css'))) {
			throw new Error('_css directory should not exist');
		}

		cb();
	},

	_assertRenameCssDir: function(cb) {
		assert.isDirectory(path.join(buildPath, '_css'));

		cb();
	},

	_assertSrc: function(cb) {
		var cssPath = path.join(buildPath, 'css');
		var jsPath = path.join(buildPath, 'js');
		var templatesPath = path.join(buildPath, 'templates');

		assert.isDirectory(cssPath);
		assert.isDirectory(jsPath);
		assert.isDirectory(path.join(buildPath, 'images'));
		assert.isDirectory(path.join(buildPath, 'WEB-INF'));
		assert.isDirectory(templatesPath);

		var customCSSFileName = getCssFileName(version);

		var customCSSPath = path.join(cssPath, customCSSFileName);

		var fileContent = testUtil.stripNewlines(fs.readFileSync(customCSSPath, {
			encoding: 'utf8'
		}));

		assert(fileContent.indexOf('/* inject:imports *//* endinject *//* ' + customCSSFileName + ' */') > -1);

		assert.fileContentMatch(path.join(jsPath, 'main.js'), /console\.log\('main\.js'\)/);
		assert.isFile(path.join(cssPath, 'base/_text.scss'));

		var templateLanguage = themeConfig.templateLanguage;

		assert.isFile(path.join(templatesPath, 'init.' + templateLanguage));
		assert.isFile(path.join(templatesPath, 'init_custom.' + templateLanguage));
		assert.isFile(path.join(templatesPath, 'navigation.' + templateLanguage));
		assert.isFile(path.join(templatesPath, 'portal_normal.' + templateLanguage));
		assert.isFile(path.join(templatesPath, 'portal_pop_up.' + templateLanguage));
		assert.isFile(path.join(templatesPath, 'portlet.' + templateLanguage));

		assert.fileContentMatch(path.join(templatesPath, 'portal_normal.' + templateLanguage), /BASE_THEME/);

		cb();
	},

	_assertThemelets: function(cb) {
		assert.isFile(path.join(buildPath, 'themelets/test-themelet/css/_custom.scss'));
		assert.isFile(path.join(buildPath, 'themelets/test-themelet/images/icon.png'));
		assert.isFile(path.join(buildPath, 'themelets/test-themelet/js/main.js'));
		assert.isFile(path.join(buildPath, 'themelets/test-themelet/templates/freemarker.ftl'));
		assert.isFile(path.join(buildPath, 'themelets/test-themelet/templates/velocity.vm'));

		var customCSSFileName = getCssFileName(version);

		assert.fileContentMatch(path.join(buildPath, 'css', customCSSFileName), /@import "\.\.\/themelets\/test-themelet\/css\/_custom\.scss";/);

		// TODO: add inject tags to both 6.2 and 7.0 themes when in development
		if (version != '6.2') {
			assert.fileContentMatch(path.join(buildPath, 'templates/portal_normal.ftl'), /<script src="\${theme_display\.getPathThemeRoot\(\)}\/themelets\/test-themelet\/js\/main\.js"><\/script>/);
		}

		cb();
	},

	_assertWar: function(cb) {
		assert.isFile(path.join(tempPath, 'dist/base-theme.war'));

		cb();
	},

	_assertWebInf: function(cb) {
		var pathWebInf = path.join(buildPath, 'WEB-INF');

		assert.isDirectory(pathWebInf);

		assert.isFile(path.join(pathWebInf, 'liferay-plugin-package.properties'));

		cb();
	}
});

module.exports = helper;

function getCssFileName(version) {
	var fileName = '_custom.scss';

	if (version == '6.2') {
		fileName = 'custom.css';
	}

	return fileName;
}
