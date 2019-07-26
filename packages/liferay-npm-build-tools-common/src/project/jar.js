/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import prop from 'dot-prop';
import readJsonSync from 'read-json-sync';

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
	 * Get output directory for JAR file
	 */
	get outputDir() {
		const {_npmbundlerrc} = this._project;

		if (this._outputDir === undefined) {
			this._outputDir = prop.get(
				_npmbundlerrc,
				'create-jar.output-dir',
				this.supported ? this._project.buildDir : undefined
			);
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

		return prop.has(_npmbundlerrc, 'create-jar');
	}
}
