/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import prop from 'dot-prop';
import readJsonSync from 'read-json-sync';

import FilePath from '../file-path';
import {getFeaturesFilePath} from './util';

/**
 * Reflects JAR file configuration of JS Toolkit projects.
 */
export default class Jar {
	/**
	 *
	 * @param {Project} project
	 */
	constructor(project) {
		this._project = project;

		this._customManifestHeaders = undefined;
		this._outputDir = undefined;
		this._outputFilename = undefined;
		this._webContextPath = undefined;
	}

	/**
	 * Get user configured manifest headers
	 */
	get customManifestHeaders() {
		const {_npmbundlerrc} = this._project;

		if (this._customManifestHeaders === undefined) {
			const manifestFilePath = getFeaturesFilePath(
				this._project,
				'create-jar.features.manifest',
				'features/manifest.json'
			);

			const featuresHeaders = manifestFilePath
				? readJsonSync(manifestFilePath)
				: {};

			const npmbundlerrcHeaders = prop.get(
				_npmbundlerrc,
				'create-jar.customManifestHeaders',
				{}
			);

			this._customManifestHeaders = Object.assign(
				npmbundlerrcHeaders,
				featuresHeaders
			);
		}

		return this._customManifestHeaders;
	}

	/**
	 * Get output directory for JAR file relative to `project.dir` and
	 * starting with `./`
	 * @return {FilePath}
	 */
	get outputDir() {
		const {_project} = this;
		const {_npmbundlerrc} = _project;

		if (this._outputDir === undefined) {
			let outputDirPosixPath = prop.get(
				_npmbundlerrc,
				'create-jar.output-dir',
				this.supported ? _project.buildDir.asPosix : undefined
			);

			if (outputDirPosixPath !== undefined) {
				if (!outputDirPosixPath.startsWith('./')) {
					outputDirPosixPath = `./${outputDirPosixPath}`;
				}

				this._outputDir = new FilePath(outputDirPosixPath, {
					posix: true,
				});
			}
		}

		return this._outputDir;
	}

	/**
	 * Get filename of output JAR file
	 */
	get outputFilename() {
		const {_npmbundlerrc, _pkgJson} = this._project;

		if (this._outputFilename === undefined) {
			this._outputFilename = prop.get(
				_npmbundlerrc,
				'create-jar.output-filename',
				this.supported
					? _pkgJson.name + '-' + _pkgJson.version + '.jar'
					: undefined
			);
		}

		return this._outputFilename;
	}

	/**
	 * @return {boolean}
	 */
	get supported() {
		const {_npmbundlerrc} = this._project;

		return !!prop.get(_npmbundlerrc, 'create-jar', false);
	}

	get webContextPath() {
		const {_npmbundlerrc, _pkgJson} = this._project;

		if (!this._webContextPath) {
			this._webContextPath = prop.get(
				_npmbundlerrc,
				'create-jar.features.web-context',
				// TODO: deprecated 'web-context-path', remove for the next major version
				prop.get(
					_npmbundlerrc,
					'create-jar.web-context-path',
					// TODO: deprecated 'osgi.Web-ContextPath', remove for the next major version
					prop.get(
						_pkgJson,
						'osgi.Web-ContextPath',
						`/${_pkgJson.name}-${_pkgJson.version}`
					)
				)
			);
		}

		return this._webContextPath;
	}
}
