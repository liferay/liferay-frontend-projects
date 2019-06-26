/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

/**
 * ESLint doesn't provide a way to bundle a config and rules together in one
 * package, so this ghastly helper monkey-patches `require` to enable us to
 * expose bundled rule plugins from inside eslint-config-liferay without
 * actually having to separately publish a "eslint-plugin-liferay" or
 * "eslint-plugin-liferay-portal" package.
 */

const fs = require('fs');
const Module = require('module');
const path = require('path');

const localPlugins = new Map();

let originalRequire;

/**
 * Monkey-patches `require` with an override that knows how to locate plug-ins
 * that have been previously registered with `local()`.
 */
function patch() {
	if (!originalRequire) {
		originalRequire = Module.prototype.require;

		Module.prototype.require = function(id) {
			if (localPlugins.has(id)) {
				return originalRequire.call(this, localPlugins.get(id));
			} else {
				return originalRequire.call(this, id);
			}
		};
	}
}

/**
 * Registers `pluginName` as a local plugin bundled with eslint-config-liferay.
 */
function local(pluginName) {
	const basename = pluginName.startsWith('eslint-plugin-')
		? pluginName
		: `eslint-plugin-${pluginName}`;

	const location = path.join(__dirname, '../plugins/', basename);

	if (!fs.existsSync(location)) {
		throw new Error(`local(): no plug-in found at ${location}`);
	}

	localPlugins.set(basename, location);

	// Make sure `require()` implementation is patched.
	patch();

	return pluginName;
}

module.exports = local;
