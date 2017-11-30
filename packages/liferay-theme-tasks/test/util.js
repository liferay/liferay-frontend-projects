'use strict';

let _ = require('lodash');
let assert = require('chai').assert;
let del = require('del');
let fs = require('fs-extra');
let Gulp = require('gulp').Gulp;
let os = require('os');
let path = require('path');
let sinon = require('sinon');

let osTempDir = os.tmpdir();

module.exports.assertBoundFunction = function(prototype, methodName, stub) {
	prototype[methodName] = sinon.spy();

	return function(fn) {
		fn('argument');

		assert(prototype[methodName].calledOnce);
		assert(prototype[methodName].calledWith('argument'));
	};
};

let PrototypeMethodSpy = function() {
	this.methods = [];
};

PrototypeMethodSpy.prototype.add = function(parent, methodName, stub) {
	if (!parent[methodName]) {
		throw new Error(methodName + ' is not a method of ' + parent.name);
	}

	this.methods.push({
		method: parent[methodName],
		methodName: methodName,
		parent: parent,
	});

	if (stub) {
		parent[methodName] = sinon.stub();
	} else {
		parent[methodName] = sinon.spy();
	}

	return parent[methodName];
};

PrototypeMethodSpy.prototype.flush = function() {
	_.forEach(this.methods, function(item, index) {
		item.parent[item.methodName] = item.method;
	});

	this.methods = [];
};

module.exports.PrototypeMethodSpy = PrototypeMethodSpy;

function copyTempTheme(options, cb) {
	let themeName = options.themeName || 'base-theme';
	let version = options.version || '7.0';

	let tempPath = path.join(
		osTempDir,
		'liferay-theme-tasks',
		options.namespace,
		version,
		themeName
	);

	let gulp;
	let registerTasksOptions;
	let runSequence;

	fs.copy(
		path.join(__dirname, './fixtures/themes', version, themeName),
		tempPath,
		function(err) {
			if (err) throw err;

			process.chdir(tempPath);

			if (options.themeConfig) {
				let lfrThemeConfig = require('../lib/liferay_theme_config');

				lfrThemeConfig.setConfig(options.themeConfig);
			}

			if (options.registerTasksOptions || options.registerTasks) {
				deleteJsFromCache();

				let registerTasks = require('../index.js').registerTasks;

				gulp = new Gulp();

				registerTasksOptions = _.assign(
					{
						distName: 'base-theme',
						pathBuild: './custom_build_path',
						gulp: gulp,
						pathSrc: './custom_src_path',
						rubySass: false,
						insideTests: true,
					},
					options.registerTasksOptions
				);

				registerTasks(registerTasksOptions);

				runSequence = require('run-sequence').use(gulp);
			}

			cb({
				gulp: gulp,
				registerTasksOptions: registerTasksOptions,
				runSequence: runSequence,
				tempPath: tempPath,
			});
		}
	);
}

function cleanDirectory(directory) {
	del.sync(path.join(directory, '**'), {
		force: true,
	});
}

function cleanTempTheme(themeName, version, component, cb) {
	let tempPath = path.join(
		osTempDir,
		'liferay-theme-tasks',
		component,
		version,
		themeName
	);

	if (arguments.length > 3) {
		setTimeout(function() {
			cleanDirectory(tempPath);

			cb();
		}, 100);
	} else {
		cleanDirectory(tempPath);
	}
}

module.exports.cleanTempTheme = cleanTempTheme;
module.exports.copyTempTheme = copyTempTheme;

function deleteDirJsFromCache(relativePath) {
	let files = fs.readdirSync(path.join(__dirname, relativePath));

	_.forEach(files, function(item, index) {
		if (_.endsWith(item, '.js')) {
			deleteJsFileFromCache(path.join(__dirname, relativePath, item));
		}
	});
}

function deleteJsFileFromCache(filePath) {
	let registerTasksPath = require.resolve(filePath);

	delete require.cache[registerTasksPath];
}

function deleteJsFromCache() {
	deleteDirJsFromCache('../lib');
	deleteDirJsFromCache('../lib/prompts');
	deleteDirJsFromCache('../lib/upgrade/6.2');
	deleteDirJsFromCache('../tasks');

	deleteJsFileFromCache('../index.js');
}

module.exports.deleteJsFromCache = deleteJsFromCache;

function stripNewlines(string) {
	return string.replace(/\r?\n|\r/g, '');
}

module.exports.stripNewlines = stripNewlines;
