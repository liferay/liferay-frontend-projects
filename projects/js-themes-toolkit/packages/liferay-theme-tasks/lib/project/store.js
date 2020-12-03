/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs-extra');
const {
	default: FilePath,
} = require('liferay-npm-build-tools-common/lib/file-path');
const path = require('path');

/**
 * Collection of properties that must be persisted to the .json file. All others
 * not listed here are transient (in-memory only).
 *
 * They are indexed by type.
 */
const PERSISTENT_PROPERTIES = {
	FilePath: ['appServerPath', 'deployPath'],
	primitive: [
		'deployed',
		'deploymentStrategy',
		'dockerContainerName',
		'pluginName',
		'url',
	],
};

class Store {
	constructor(project, fileName, section) {
		this._project = project;
		this._section = section;
		this._filePath = path.join(project.dir, fileName);

		// Load default values
		this._deployed = false;
		this._pluginName = path.basename(project.dir);

		this._readJSON();
	}

	/**
	 * Path to application server (f.e.: /liferay/tomcat)
	 *
	 * @return {FilePath}
	 */
	get appServerPath() {
		return this._appServerPath;
	}

	/**
	 * When in watch mode, absolute path to changed file that caused a rebuild
	 * (f.e.: /home/me/my-theme/src/css/_custom.scss)
	 *
	 * @remarks
	 * This setting is transient and is not persisted to the underlying JSON
	 * file.
	 *
	 * @return {path: string}
	 */
	get changedFile() {
		return this._changedFile;
	}

	/**
	 * Path to Liferay's deploy directory (f.e.: /liferay/deploy)
	 *
	 * @return {FilePath}
	 */
	get deployPath() {
		return this._deployPath;
	}

	/**
	 * Check if the project has been deployed at least once.
	 *
	 * @remarks
	 * This value is not read by the application anywhere, but it is kept for
	 * compatibility reasons.
	 *
	 * @return {boolean}
	 */
	get deployed() {
		return this._deployed;
	}

	/**
	 * @return 'LocalAppServer' | 'DockerContainer' | 'Other'
	 */
	get deploymentStrategy() {
		return this._deploymentStrategy;
	}

	/**
	 * @return {string}
	 */
	get dockerContainerName() {
		return this._dockerContainerName;
	}

	/**
	 * Name of temporary directory to use when deploying to Liferay as a Docker
	 * instance.
	 *
	 * @return {string}
	 */
	get pluginName() {
		return this._pluginName;
	}

	/**
	 * URL of Liferay server instance (f.e.: http://localhost:8080)
	 *
	 * @return {string}
	 */
	get url() {
		return this._url;
	}

	/**
	 * Set to 'watching' when in the middle of a watch operation.
	 *
	 * @remarks
	 * This setting is transient and is not persisted to the underlying JSON
	 * file.
	 *
	 * @return {'watching' | undefined}
	 */
	get webBundleDir() {
		return this._webBundleDir;
	}

	/**
	 * @param {FilePath | string} appServerPath
	 */
	set appServerPath(appServerPath) {
		if (typeof appServerPath === 'string') {
			appServerPath = new FilePath(appServerPath);
		}

		this._appServerPath = appServerPath;
		this._writeJSON();
	}

	set changedFile(changedFile) {
		this._changedFile = changedFile;
	}

	/**
	 * @param {FilePath | string} deployPath
	 */
	set deployPath(deployPath) {
		if (typeof deployPath === 'string') {
			deployPath = new FilePath(deployPath);
		}

		this._deployPath = deployPath;
		this._writeJSON();
	}

	set deployed(deployed) {
		this._deployed = deployed;
		this._writeJSON();
	}

	set deploymentStrategy(deploymentStrategy) {
		this._deploymentStrategy = deploymentStrategy;
		this._writeJSON();
	}

	set dockerContainerName(dockerContainerName) {
		this._dockerContainerName = dockerContainerName;
		this._writeJSON();
	}

	set pluginName(pluginName) {
		this._pluginName = pluginName;
		this._writeJSON();
	}

	set url(url) {
		this._url = url;
		this._writeJSON();
	}

	set webBundleDir(webBundleDir) {
		this._webBundleDir = webBundleDir;
	}

	_readJSON() {
		let json = {};

		try {
			json = fs.readJSONSync(this._filePath);
		} catch (err) {
			if (err.code !== 'ENOENT') {
				throw err;
			}
		}

		json = json[this._section] || {};

		PERSISTENT_PROPERTIES.FilePath.forEach(prop => {
			const posixPath = json[prop];

			if (posixPath !== undefined) {
				this[`_${prop}`] = new FilePath(posixPath, {posix: true});
			}
		});

		PERSISTENT_PROPERTIES.primitive.forEach(prop => {
			this[`_${prop}`] = json[prop];
		});
	}

	_writeJSON() {
		const json = {};

		json[this._section] = {
			...PERSISTENT_PROPERTIES.FilePath.reduce((props, key) => {
				const val = this[key];

				if (val !== undefined) {
					props[key] = val.asPosix;
				}

				return props;
			}, {}),

			...PERSISTENT_PROPERTIES.primitive.reduce((props, key) => {
				const val = this[key];

				props[key] = val;

				return props;
			}, {}),
		};

		fs.writeJSONSync(this._filePath, json, {spaces: 2});
	}
}

module.exports = Store;
