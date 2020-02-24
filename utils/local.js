/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

/**
 * ESLint doesn't provide a way to bundle a config and rules together
 * in one package, so this ghastly helper applies monkey-patches
 * to enable us to expose bundled rule plugins from inside
 * eslint-config-liferay without actually having to separately publish a
 * "eslint-plugin-liferay" or "eslint-plugin-liferay-portal" package.
 */

const fs = require('fs');
const Module = require('module');
const path = require('path');

const localPlugins = new Map();

let originalRequire;

let originalResolve;

/**
 * Apply monkey-patches that know how to locate plug-ins that have been
 * previously registered with `local()`.
 *
 * Prior to ESLInt 6, we patch `require` itself.
 *
 * For ESLint 6, we have to patch its "relative-module-resolver", because it no
 * longer uses `require` since:
 *
 * https://github.com/eslint/eslint/commit/6ae21a4bfe5a
 */
function patch() {
	const eslint = require.resolve('eslint/package.json', {
		paths: [process.cwd()],
	});
	const version = JSON.parse(fs.readFileSync(eslint, 'utf8')).version;
	const match = version.match(/^(\d+)/);
	const majorVersion = match ? parseInt(match[1], 10) : 0;

	if (majorVersion > 5) {
		if (!originalResolve) {
			// eslint-disable-next-line liferay/no-dynamic-require
			const resolver = require(require.resolve(
				'eslint/lib/shared/relative-module-resolver',
				{paths: [process.cwd()]}
			));

			originalResolve = resolver.resolve;

			resolver.resolve = function(id, ...rest) {
				if (localPlugins.has(id)) {
					return localPlugins.get(id);
				} else {
					return originalResolve.call(resolver, id, ...rest);
				}
			};
		}
	} else {
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

	// Make sure patches are applied.
	patch();

	return pluginName;
}

module.exports = local;
