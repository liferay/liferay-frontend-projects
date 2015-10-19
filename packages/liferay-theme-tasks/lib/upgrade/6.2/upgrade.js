'use strict';

var _ = require('lodash');
var ConvertBootstrapCLI = require('../../../node_modules/convert-bootstrap-2-to-3/lib/cli').constructor;
var del = require('del');
var fs = require('fs-extra');
var glob = require('glob');
var gulpBlackList = require('./gulp_black_list.js');
var inquirer = require('inquirer');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var replace = require('gulp-replace-task');

var gutil = plugins.util;

var colors = gutil.colors;

var CWD = process.cwd();

var DIR_SRC_CSS = 'src/css';

var logBuffers = {
	bootstrap: [getLogHeader('Bootstrap Upgrade (2 to 3)')],
	liferay: [getLogHeader('Liferay Upgrade (6.2 to 7)')]
};

module.exports = function(options) {
	var gulp = options.gulp;

	var runSequence = require('run-sequence').use(gulp);

	var cssSrcPath = path.join(CWD, 'src/css/**/*.+(css|scss)');

	var patterns;

	gulp.task('upgrade', function(cb) {
		runSequence(
			'upgrade:create-backup-files',
			'upgrade:black-list',
			'upgrade:replace-compass',
			'upgrade:convert-bootstrap',
			'upgrade:config',
			'upgrade:rename-core-files',
			'upgrade:create-css-diff',
			'upgrade:dependencies',
			'upgrade:create-deprecated-mixins',
			'upgrade:templates',
			'upgrade:log-changes',
			cb
		);
	});

	gulp.task('upgrade:convert-bootstrap', function(cb) {
		var exec = require('child_process').exec;

		var files = glob.sync('src/css/*');

		var convertBootstrap = new ConvertBootstrapCLI({
			args: files
		});

		_.assign(convertBootstrap, {
			logResults: function(out, file) {
				logBuffers.bootstrap.push(out);
			},

			onFinish: cb
		});

		convertBootstrap.init();
	});

	gulp.task('upgrade:create-backup-files', function(cb) {
		var backupExists = fs.existsSync('_backup');

		var backup = function() {
			gulp.src('src/**/*')
				.pipe(gulp.dest('_backup/src'))
				.on('end', cb);
		};

		if (backupExists) {
			inquirer.prompt({
				default: false,
				message: 'Would you like to overwrite the existing _backup directory and it\'s contents?',
				name: 'backup',
				type: 'confirm'
			}, function(answers) {
				if (answers.backup) {
					backup();
				}
				else {
					cb();
				}
			});
		}
		else {
			backup();
		}
	});

	gulp.task('upgrade:create-css-diff', function() {
		var gulpCssDiff = require('./gulp_css_diff.js');

		return gulp.src('src/css/**/*')
			.pipe(gulpCssDiff())
			.pipe(plugins.concat('css.diff'))
			.pipe(gulp.dest('_backup', {
				overwrite: true
			}));
	});

	gulp.task('upgrade:dependencies', function(cb) {
		var themeTasksPath = path.join(CWD, 'node_modules/liferay-theme-tasks');

		process.chdir(themeTasksPath);

		var npm = require('../../../scripts/install.js');

		npm.on('dependenciesInstalled', function() {
			process.chdir(CWD);

			cb();
		});
	});

	gulp.task('upgrade:black-list', function() {
		return gulp.src(cssSrcPath)
			.pipe(gulpBlackList(null, function(result) {
				patterns = require('./replace_patterns.js')(result);
			}));
	});

	gulp.task('upgrade:config', function() {
		var lfrThemeConfig = require('../../liferay_theme_config.js');

		lfrThemeConfig.setConfig({
			supportCompass: false,
			version: '7.0'
		});

		return gulp.src('src/WEB-INF/+(liferay-plugin-package.properties|liferay-look-and-feel.xml)')
			.pipe(replace({
				patterns: [
					{
						match: /6\.2\.\d+\+/g,
						replacement: '7.0.0+'
					},
					{
						match: /6\.2\.0/g,
						replacement: '7.0.0'
					},
					{
						match: /6_2_0/g,
						replacement: '7_0_0'
					}
				]
			}))
			.pipe(gulp.dest('src/WEB-INF'));
	});

	gulp.task('upgrade:create-deprecated-mixins', function(cb) {
		var NEW_LINE = '\n';

		var compassPath = path.join(__dirname, '../../../node_modules/compass-mixins/lib/_compass.scss');

		var includeCompass = '@import "' + compassPath + '";' + NEW_LINE + NEW_LINE;

		var deprecatedMixins = _.map(require('./theme_data/deprecated_mixins.json'), function(item, index) {
			var buffer = ['@mixin '];

			buffer.push(item);
			buffer.push('-deprecated');
			buffer.push('($args...) {');
			buffer.push(NEW_LINE);
			buffer.push('\t@warn "the ');
			buffer.push(item);
			buffer.push(' mixin is deprecated, and will be removed in the next major release";');
			buffer.push(NEW_LINE);
			buffer.push('\t@include ');
			buffer.push(item);
			buffer.push('($args...);');
			buffer.push(NEW_LINE);
			buffer.push('}');
			buffer.push(NEW_LINE);
			buffer.push(NEW_LINE);

			return buffer.join('');
		});

		var tmpPath = path.join(__dirname, '../../../tmp');

		fs.mkdirsSync(path.join(tmpPath));
		fs.writeFileSync(path.join(tmpPath, '_deprecated.scss'), includeCompass + deprecatedMixins.join(''));

		var createBourbonFile = require('../../bourbon_dependencies').createBourbonFile;

		createBourbonFile(true);

		cb();
	});

	gulp.task('upgrade:log-changes', function(cb) {
		var stdout = process.stdout;

		logBuffer(logBuffers.bootstrap);
		logBuffer(logBuffers.liferay);

		cb();
	});

	gulp.task('upgrade:rename-core-files', function(cb) {
		var renamedCssFiles = require('./theme_data/renamed_css_files.json');

		var baseFile = ['aui', 'main'];

		var prompts = [];
		var srcPaths = [];

		_.forEach(fs.readdirSync(path.join(CWD, DIR_SRC_CSS)), function(item, index) {
			var fileName = path.basename(item, '.css');

			if (path.extname(item) == '.css' && renamedCssFiles.indexOf(fileName) > -1) {
				srcPaths.push(path.join(CWD, DIR_SRC_CSS, item));

				var scssSuffixMessage = 'Do you want to rename ' + item + ' to ' + fileName + '.scss?';
				var underscorePrefixMessage = 'Do you want to rename ' + item + ' to _' + fileName + '.scss?';

				prompts.push({
					message: baseFile.indexOf(fileName) > -1 ? scssSuffixMessage : underscorePrefixMessage,
					name: item,
					type: 'confirm'
				});
			}
		});

		var promptResults;

		gulp.src(srcPaths)
			.pipe(plugins.prompt.prompt(prompts, function(results) {
				promptResults = results;
			}))
			.pipe(plugins.filter(function(file) {
				var fileName = path.basename(file.path);

				return promptResults[fileName];
			}))
			.pipe(plugins.rename(function(path) {
				path.extname = '.scss';

				if (baseFile.indexOf(path.basename) < 0) {
					path.basename = '_' + path.basename;
				}
			}))
			.pipe(gulp.dest(DIR_SRC_CSS))
			.on('end', function() {
				srcPaths = _.reduce(srcPaths, function(result, item, index) {
					var fileName = path.basename(item);

					if (promptResults[fileName]) {
						result.push(item);
					}

					return result;
				}, []);

				del(srcPaths, cb);
			});
	});

	gulp.task('upgrade:replace-compass', function() {
		return gulp.src(cssSrcPath)
			.pipe(replace({
				patterns: patterns
			}))
			.pipe(gulp.dest(DIR_SRC_CSS));
	});

	gulp.task('upgrade:templates', function(cb) {
		checkFile('src/templates/portal_normal.vm', [
			{
				message: 'Warning: #dockbar() is deprecated, replace with #control_menu() and #product_menu_sidebar($liferay_product_menu_state) for new admin controls.',
				regex: /#dockbar\(\)/g
			},
			{
				negativeMatch: true,
				message: 'Warning: not all admin controls will be visible without #control_menu()',
				regex: /#control_menu\(\)/g
			},
			{
				negativeMatch: true,
				message: 'Warning: not all admin controls will be visible without #product_menu_sidebar($liferay_product_menu_state)',
				regex: /#product_menu_sidebar\(/g
			}
		]);

		checkFile('src/templates/portal_normal.ftl', [
			{
				message: 'Warning: <@liferay.dockbar /> is deprecated, replace with <@liferay.control_menu /> and <@liferay.product_menu_sidebar(liferay_product_menu_state) /> for new admin controls.',
				regex: /<@liferay\.dockbar\s\/>/g
			},
			{
				negativeMatch: true,
				message: 'Warning: not all admin controls will be visible without <@liferay.control_menu />',
				regex: /<@liferay\.control_menu\s\/>/g
			},
			{
				negativeMatch: true,
				message: 'Warning: not all admin controls will be visible without <@liferay.product_menu_sidebar(liferay_product_menu_state) />',
				regex: /<@liferay\.product_menu_sidebar\(/g
			}
		]);

		cb();
	});
};

function checkFile(filePath, rules) {
	var config = {
		encoding: 'utf8'
	};

	filePath = path.join(CWD, filePath);

	if (fs.existsSync(filePath)) {
		var fileName = colors.white('File: ' + colors.underline(path.basename(filePath)) + '\n');

		logBuffers.liferay.push(fileName);

		var fileContents = fs.readFileSync(filePath, config);

		_.forEach(rules, function(item, index) {
			var match = item.negativeMatch ? !item.regex.test(fileContents) : item.regex.test(fileContents);

			if (match) {
				logBuffers.liferay.push('    ' + colors.yellow(item.message) + '\n');
			}
		});
	}
}

function getLogHeader(header) {
	var line = new Array(65).join('-');

	return colors.bold('\n' + line + '\n ' + header + '\n' + line + '\n\n');
}

function logBuffer(buffer) {
	process.stdout.write(colors.bgBlack(buffer.join('')));
}