/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const del = require('del');
const fs = require('fs-extra');
const {Gulp} = require('gulp');
const _ = require('lodash');
const os = require('os');
const path = require('path');
const sinon = require('sinon');

const osTempDir = os.tmpdir();

/* eslint-disable no-console */

const saved = {
	console: {
		log: console.log,
	},
	process: {
		stdout: {
			write: process.stdout.write,
		},
	},
};

function hideConsole() {
	process.stdout.write = console.log = () => undefined;
}

function restoreConsole() {
	process.stdout.write = saved.process.stdout.write;
	console.log = saved.console.log;
}

expect.extend({
	toBeEmptyFolder(path) {
		let pass = true;
		let message = '';

		if (this.isNot) {
			try {
				if (!fs.statSync(path).isDirectory()) {
					pass = false;
					message = `Path '${path}' is not a folder`;
				}
				else if (fs.readdirSync(path).length === 0) {
					pass = false;
					message = `Folder '${path}' is empty`;
				}
			}
			catch (err) {
				pass = false;

				if (err.code === 'ENOENT') {
					message = `Folder '${path}' does not exist`;
				}
				else {
					message = err.toString();
				}
			}

			pass = !pass;
		}
		else {
			try {
				if (!fs.statSync(path).isDirectory()) {
					pass = false;
					message = `Path '${path}' is not a folder`;
				}
				else if (fs.readdirSync(path).length !== 0) {
					pass = false;
					message = `Folder '${path}' is not empty`;
				}
			}
			catch (err) {
				pass = false;

				if (err.code === 'ENOENT') {
					message = `Folder '${path}' does not exist`;
				}
				else {
					message = err.toString();
				}
			}
		}

		return {
			message: () => message,
			pass,
		};
	},

	toBeFile(path) {
		let pass = true;
		let message = '';

		try {
			if (!fs.statSync(path).isFile()) {
				pass = false;
				message = `Path '${path}' is not a file`;
			}
		}
		catch (err) {
			pass = false;
			message = err.toString();
		}

		if (this.isNot && pass) {
			message = `File '${path}' exists`;
		}

		return {
			message: () => message,
			pass,
		};
	},

	toBeFileMatching(path, regex) {
		let pass = true;
		let message = '';

		if (this.isNot) {
			try {
				if (!fs.statSync(path).isFile()) {
					pass = false;
					message = `Path '${path}' is not a file`;
				}
				else if (regex.test(fs.readFileSync(path).toString())) {
					pass = false;
					message = `File '${path}' matches ${regex}`;
				}
			}
			catch (err) {
				pass = false;

				if (err.code === 'ENOENT') {
					message = `File '${path}' does not exist`;
				}
				else {
					message = err.toString();
				}
			}

			pass = !pass;
		}
		else {
			try {
				if (!fs.statSync(path).isFile()) {
					pass = false;
					message = `Path '${path}' is not a file`;
				}
				else if (!regex.test(fs.readFileSync(path).toString())) {
					pass = false;
					message = `File '${path}' does not match ${regex}`;
				}
			}
			catch (err) {
				pass = false;

				if (err.code === 'ENOENT') {
					message = `File '${path}' does not exist`;
				}
				else {
					message = err.toString();
				}
			}
		}

		return {
			message: () => message,
			pass,
		};
	},

	toBeFolder(path) {
		let pass = true;
		let message = '';

		try {
			if (!fs.statSync(path).isDirectory()) {
				pass = false;
				message = `Path '${path}' is not a folder`;
			}
		}
		catch (err) {
			pass = false;
			message = err.toString();
		}

		if (this.isNot && pass) {
			message = `Folder '${path}' exists`;
		}

		return {
			message: () => message,
			pass,
		};
	},
});

class PrototypeMethodSpy {
	constructor() {
		this.methods = [];
	}

	add(parent, methodName, stub) {
		if (!parent[methodName]) {
			throw new Error(methodName + ' is not a method of ' + parent.name);
		}

		this.methods.push({
			method: parent[methodName],
			methodName,
			parent,
		});

		if (stub) {
			parent[methodName] = sinon.stub();
		}
		else {
			parent[methodName] = sinon.spy();
		}

		return parent[methodName];
	}

	flush() {
		_.forEach(this.methods, (item) => {
			item.parent[item.methodName] = item.method;
		});

		this.methods = [];
	}
}

function assertBoundFunction(prototype, methodName, _stub) {
	prototype[methodName] = sinon.spy();

	return function (fn) {
		fn('argument');

		expect(prototype[methodName].calledOnce).toBe(true);
		expect(prototype[methodName].calledWith('argument')).toBe(true);
	};
}

function copyTempTheme(options) {
	const themeName = options.themeName || 'base-theme';
	const version = options.version || '7.0';
	const namespace = options.namespace;

	const tempPath = path.join(
		osTempDir,
		'liferay-theme-tasks',
		namespace,
		version,
		themeName
	);

	cleanDirectory(tempPath);

	let gulp;
	let registerTasksOptions;
	let runSequence;

	fs.copySync(
		path.join(__dirname, './fixtures', version, themeName),
		tempPath
	);

	process.chdir(tempPath);

	if (options.themeConfig) {
		const lfrThemeConfig = require('../lib/liferay_theme_config');

		lfrThemeConfig.setConfig(options.themeConfig);
	}

	if (options.registerTasksOptions || options.registerTasks) {
		deleteJsFromCache();

		const {registerTasks} = require('../index');

		gulp = new Gulp();

		registerTasksOptions = _.assign(
			{
				distName: 'base-theme',
				gulp,
				insideTests: true,
				pathBuild: './custom_build_path',
				pathSrc: './custom_src_path',
			},
			options.registerTasksOptions
		);

		registerTasks(registerTasksOptions);

		runSequence = require('run-sequence').use(gulp);
	}

	return {
		gulp,
		registerTasksOptions,
		runSequence,
		tempPath,
	};
}

function cleanTempTheme(themeName, version, component, initCwd) {
	const tempPath = path.join(
		osTempDir,
		'liferay-theme-tasks',
		component,
		version,
		themeName
	);

	cleanDirectory(tempPath);

	if (initCwd !== null && initCwd !== undefined) {
		process.chdir(initCwd);
	}
}

function deleteDirJsFromCache(relativePath) {
	const files = fs.readdirSync(path.join(__dirname, relativePath));

	_.forEach(files, (item) => {
		if (_.endsWith(item, '.js')) {
			deleteJsFileFromCache(path.join(__dirname, relativePath, item));
		}
	});
}

function deleteJsFileFromCache(filePath) {
	const registerTasksPath = require.resolve(filePath);

	delete require.cache[registerTasksPath];
}

function stripNewlines(string) {
	return string.replace(/\r?\n|\r/g, '');
}

module.exports = {
	PrototypeMethodSpy,
	assertBoundFunction,
	cleanTempTheme,
	copyTempTheme,
	hideConsole,
	restoreConsole,
	stripNewlines,
};

function cleanDirectory(directory) {
	del.sync(path.join(directory, '**'), {
		force: true,
	});
}

function deleteJsFromCache() {
	deleteDirJsFromCache('../lib');
	deleteDirJsFromCache('../lib/prompts');
	deleteDirJsFromCache('../lib/upgrade/6.2');
	deleteDirJsFromCache('../tasks');
	deleteJsFileFromCache('../index.js');
}
