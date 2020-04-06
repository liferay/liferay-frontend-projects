/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const {
	default: FilePath,
} = require('liferay-npm-build-tools-common/lib/file-path');
const {print, warn} = require('liferay-npm-build-tools-common/lib/format');

class Options {
	constructor(project, options) {
		this._project = project;
		this._options = options;
		this._windowsPathWarned = false;

		this._normalizeFilePath('pathBuild');
		this._normalizeFilePath('pathDist');
		this._normalizeFilePath('pathSrc');
		this._normalizeFilePath('rootDir');
	}

	get argv() {
		return this._options['argv'];
	}

	/**
	 * Name of output artifact
	 */
	get distName() {
		return this._options['distName'];
	}

	/**
	 * Build directory as POSIX path
	 */
	get pathBuild() {
		return this._options['pathBuild'];
	}

	/**
	 * Dist directory as POSIX path
	 */
	get pathDist() {
		return this._options['pathDist'];
	}

	/**
	 * Source directory as POSIX path
	 */
	get pathSrc() {
		return this._options['pathSrc'];
	}

	get postcss() {
		return this._options['postcss'];
	}

	/**
	 * URL prefix of resources (usually '/o')
	 */
	get resourcePrefix() {
		return this._options['resourcePrefix'];
	}

	/**
	 * Docroot directory as POSIX path
	 */
	get rootDir() {
		return this._options['rootDir'];
	}

	get sassOptions() {
		return this._options['sassOptions'];
	}

	_normalizeFilePath(optionName) {
		const {_options} = this;

		if (_options[optionName] === undefined) {
			return;
		}

		if (_options[optionName].includes('\\') && !this._windowsPathWarned) {
			print(
				warn`
				Option ${optionName} contains '\\' characters.

				This can be due to using Windows paths in a config file, which is not
				supported, or because its use is legitimate in POSIX paths. 

				In the first case, you should edit your 'gulpfile.js' and change any
				paths to be in POSIX format.

				In the latter case, you should consider stop using '\\' characters in
				paths are they are not platform independent and will fail in Windows
				platforms.
				`
			);

			this._windowsPathWarned = true;
		}

		_options[optionName] = new FilePath(_options[optionName], {
			posix: true,
		});
	}
}

module.exports = Options;
