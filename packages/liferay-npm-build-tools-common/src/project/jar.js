/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import prop from 'dot-prop';

/**
 * Reflects JAR file configuration of JS Toolkit projects.
 */
export default class Jar {
	/**
	 *
	 * @param {Project} project
	 */
	constructor({_npmbundlerrc}) {
		this._npmbundlerrc = _npmbundlerrc;
	}

	/**
	 * Get user configured manifest headers
	 */
	get customManifestHeaders() {
		if (this._customManifestHeaders === undefined) {
			this._customManifestHeaders = prop.get(
				this._npmbundlerrc,
				'create-jar.customManifestHeaders'
			);

			if (this._customManifestHeaders === undefined) {
				this._customManifestHeaders = {};
			}
		}

		return this._customManifestHeaders;
	}
}
