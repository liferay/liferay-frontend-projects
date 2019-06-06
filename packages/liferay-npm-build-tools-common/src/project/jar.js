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
				featuresHeaders,
				npmbundlerrcHeaders
			);
		}

		return this._customManifestHeaders;
	}
}
