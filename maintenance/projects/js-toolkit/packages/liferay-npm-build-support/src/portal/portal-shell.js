/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';

import GogoShell from './gogo-shell';

/**
 *
 */
export default class extends GogoShell {

	/**
	 *
	 * @param {string} fileOrDir
	 * @return {Promise} resolves to the bundle id
	 */
	install(fileOrDir) {
		return this.sendCommand(
			`install file://${path.resolve(fileOrDir)}`
		).then((response) => {
			const matches = /.*BundleId\s+(\d+).*/.exec(response);

			if (!matches || matches.length < 2) {
				throw new Error(response);
			}

			return Number.parseInt(matches[1], 10);
		});
	}

	/**
	 *
	 * @param {int} bundleId
	 * @return {Promise} resolves to the bundle id
	 */
	start(bundleId) {
		return this.sendCommand(`start ${bundleId}`).then((response) => {
			if (response.length !== 0) {
				throw new Error(response);
			}

			return bundleId;
		});
	}

	/**
	 *
	 * @param {int} bundleId
	 * @return {Promise} resolves to the bundle id
	 */
	stop(bundleId) {
		return this.sendCommand(`stop ${bundleId}`).then((response) => {
			if (response.length !== 0) {
				throw new Error(response);
			}

			return bundleId;
		});
	}

	/**
	 *
	 * @param {int} bundleId
	 * @return {Promise} resolves to undefined
	 */
	uninstall(bundleId) {
		return this.sendCommand(`uninstall ${bundleId}`).then((response) => {
			if (response.length !== 0) {
				throw new Error(response);
			}

			return undefined;
		});
	}

	/**
	 *
	 * @param {int} bundleId
	 * @return {Promise} resolves to status string
	 */
	getStatus(bundleId) {
		return this.sendCommand(`bundle ${bundleId}`).then((response) => {
			const matches = /.*Status=(\S+).*/.exec(response);

			if (!matches || matches.length < 2) {
				throw new Error(response);
			}

			return matches[1];
		});
	}

	/**
	 *
	 * @param {string} symbolicName symbolic name
	 * @param {string} version version number
	 * @return {Promise} resolves to bundle id
	 */
	getBundleId(symbolicName, version) {
		return this.sendCommand(`lb -s "${symbolicName}"`).then((response) => {
			const lines = response.split('\n');

			const bundleLine = lines.find(
				(line) => line.indexOf(`|${symbolicName} (${version})`) !== -1
			);

			if (!bundleLine) {
				throw new Error(response);
			}

			const fields = bundleLine.split('|');

			return Number.parseInt(fields[0], 10);
		});
	}
}
