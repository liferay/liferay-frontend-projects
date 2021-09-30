/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

/**
 * ESLint doesn't provide a way to bundle a config and rules together
 * in one package, so this ghastly helper applies monkey-patches
 * to enable us to expose bundled rule plugins from inside
 * @liferay/eslint-config without actually having to separately publish a
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
 *
 * For ESLint 7.8.0+, the config file handling began to be refactored into a
 * separate package, so we actually patch both just in case...
 *
 * https://github.com/eslint/eslint/commit/2bee6d256ae0
 * https://github.com/eslint/eslintrc/commit/9fb9c5da9b95
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
			const getResolver = (location) => {
				try {
					// eslint-disable-next-line @liferay/liferay/no-dynamic-require
					const resolver = require(require.resolve(location, {
						paths: [process.cwd()],
					}));

					return resolver;
				}
				catch {

					// Nothing to do.

				}
			};

			const resolvers = [
				getResolver(
					'@eslint/eslintrc/lib/shared/relative-module-resolver'
				),
				getResolver('eslint/lib/shared/relative-module-resolver'),
			].filter(Boolean);

			originalResolve = resolvers.length && resolvers[0].resolve;

			resolvers.forEach((resolver) => {
				resolver.resolve = function (id, ...rest) {
					if (localPlugins.has(id)) {
						return localPlugins.get(id);
					}
					else {
						return originalResolve.call(resolver, id, ...rest);
					}
				};
			});
		}
	}
	else {
		if (!originalRequire) {
			originalRequire = Module.prototype.require;

			Module.prototype.require = function (id) {
				if (localPlugins.has(id)) {
					return originalRequire.call(this, localPlugins.get(id));
				}
				else {
					return originalRequire.call(this, id);
				}
			};
		}
	}
}

/**
 * Registers `pluginName` as a local plugin bundled with @liferay/eslint-config.
 */
function local(pluginName) {
	const [, basename] = pluginName.match(/^@liferay\/(.+)/) || [];

	if (!basename) {
		throw new Error(
			`local(): plug-in '${pluginName}' does not start with '@liferay'`
		);
	}

	const location = path.join(__dirname, '../plugins/', basename);

	if (!fs.existsSync(location)) {
		throw new Error(`local(): no plug-in found at ${location}`);
	}

	localPlugins.set(`@liferay/eslint-plugin-${basename}`, location);

	// Make sure patches are applied.

	patch();

	return pluginName;
}

module.exports = local;
