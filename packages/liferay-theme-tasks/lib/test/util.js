/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs-extra');
const {Gulp} = require('gulp');
const _ = require('lodash');
const os = require('os');
const path = require('path');
const sinon = require('sinon');

const project = require('../project');

const osTempDir = os.tmpdir();

/* eslint-disable no-console */

expect.extend({
	toBeEmptyFolder(path) {
		let pass = true;
		let message = '';

		if (this.isNot) {
			try {
				if (!fs.statSync(path).isDirectory()) {
					pass = false;
					message = `Path '${path}' is not a folder`;
				} else if (fs.readdirSync(path).length == 0) {
					pass = false;
					message = `Folder '${path}' is empty`;
				}
			} catch (err) {
				pass = false;

				if (err.code === 'ENOENT') {
					message = `Folder '${path}' does not exist`;
				} else {
					message = err.toString();
				}
			}

			pass = !pass;
		} else {
			try {
				if (!fs.statSync(path).isDirectory()) {
					pass = false;
					message = `Path '${path}' is not a folder`;
				} else if (fs.readdirSync(path).length != 0) {
					pass = false;
					message = `Folder '${path}' is not empty`;
				}
			} catch (err) {
				pass = false;

				if (err.code === 'ENOENT') {
					message = `Folder '${path}' does not exist`;
				} else {
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
		} catch (err) {
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
				} else if (regex.test(fs.readFileSync(path).toString())) {
					pass = false;
					message = `File '${path}' matches ${regex}`;
				}
			} catch (err) {
				pass = false;

				if (err.code === 'ENOENT') {
					message = `File '${path}' does not exist`;
				} else {
					message = err.toString();
				}
			}

			pass = !pass;
		} else {
			try {
				if (!fs.statSync(path).isFile()) {
					pass = false;
					message = `Path '${path}' is not a file`;
				} else if (!regex.test(fs.readFileSync(path).toString())) {
					pass = false;
					message = `File '${path}' does not match ${regex}`;
				}
			} catch (err) {
				pass = false;

				if (err.code === 'ENOENT') {
					message = `File '${path}' does not exist`;
				} else {
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
		} catch (err) {
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
		} else {
			parent[methodName] = sinon.spy();
		}

		return parent[methodName];
	}

	flush() {
		_.forEach(this.methods, item => {
			item.parent[item.methodName] = item.method;
		});

		this.methods = [];
	}
}

function assertBoundFunction(prototype, methodName, _stub) {
	prototype[methodName] = sinon.spy();

	return function(fn) {
		fn('argument');

		expect(prototype[methodName].calledOnce).toBe(true);
		expect(prototype[methodName].calledWith('argument')).toBe(true);
	};
}

/**
 * Sets up a temporary directory with a plugin project for testing.
 *
 * @param {*} options
 * contains themeName, version, namespace, registerTaskOptions and/or
 * themeConfig fields
 *
 * @return a temporaty theme descriptor to be given to cleanTempTheme
 */
function setupTempPlugin(options) {
	const pluginName = options.pluginName;
	const version = options.version || '7.0';
	const namespace = options.namespace;

	const savedCwd = process.cwd();

	const tempPath = path.join(
		osTempDir,
		'liferay-theme-tasks',
		namespace,
		version,
		pluginName
	);

	fs.emptyDirSync(tempPath);

	fs.copySync(
		path.join(__dirname, 'fixtures', 'plugins', version, pluginName),
		tempPath
	);

	process.chdir(tempPath);
	project._reload();

	if (options.init) {
		if (options.options) {
			throw new Error(
				"Please don't use options with init: they would be ignored"
			);
		}

		options.init();
	} else {
		project.init({
			gulp: new Gulp(),
			storeConfig: {
				name: 'LiferayPlugin',
				path: 'liferay-plugin.json',
			},
			...(options.options || {}),
		});
	}

	return {
		namespace,
		pluginName,
		savedCwd,
		tempPath,
		version,
	};
}

/**
 * Sets up a temporary directory with a theme project for testing.
 *
 * @param {*} options
 * contains themeName, version, namespace, registerTaskOptions and/or
 * themeConfig fields
 *
 * @return a temporaty theme descriptor to be given to cleanTempTheme
 */
function setupTempTheme(options) {
	const themeName = options.themeName || 'base-theme';
	const version = options.version || '7.1';
	const namespace = options.namespace;

	const savedCwd = process.cwd();

	const tempPath = path.join(
		osTempDir,
		'liferay-theme-tasks',
		namespace,
		version,
		themeName
	);

	fs.emptyDirSync(tempPath);

	fs.copySync(
		path.join(__dirname, 'fixtures', 'themes', version, themeName),
		tempPath
	);

	process.chdir(tempPath);
	project._reload();

	if (options.init) {
		if (options.options) {
			throw new Error(
				"Please don't use options with init: they would be ignored"
			);
		}

		options.init();
	} else {
		project.init({
			gulp: new Gulp(),
			storeConfig: {
				name: 'LiferayTheme',
				path: 'liferay-theme.json',
			},
			...(options.options || {}),
		});
	}

	if (options.themeConfig) {
		project.themeConfig.setConfig(options.themeConfig);
	}

	return {
		namespace,
		savedCwd,
		tempPath,
		themeName,
		version,
	};
}

/**
 * Cleans up a temporary plugin project created with setupTempPlugin
 *
 * @param {*} tempPlugin the plugin descriptor returned by setupTempPlugin
 */
function cleanTempPlugin(tempPlugin) {
	const {namespace, pluginName, savedCwd, version} = tempPlugin;

	const tempPath = path.join(
		osTempDir,
		'liferay-theme-tasks',
		namespace,
		version,
		pluginName
	);

	fs.removeSync(tempPath);

	if (savedCwd != null) {
		process.chdir(savedCwd);
	}
}

/**
 * Cleans up a temporary theme project created with setupTempTheme
 *
 * @param {*} tempTheme the theme descriptor returned by setupTempTheme
 */
function cleanTempTheme(tempTheme) {
	const {namespace, savedCwd, themeName, version} = tempTheme;

	const tempPath = path.join(
		osTempDir,
		'liferay-theme-tasks',
		namespace,
		version,
		themeName
	);

	fs.removeSync(tempPath);

	if (savedCwd != null) {
		process.chdir(savedCwd);
	}
}

function stripNewlines(string) {
	return string.replace(/\r?\n|\r/g, '');
}

module.exports = {
	PrototypeMethodSpy,
	assertBoundFunction,
	cleanTempPlugin,
	cleanTempTheme,
	setupTempPlugin,
	setupTempTheme,
	stripNewlines,
};
