/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * A webpack resolver plugin to instruct webpack to get compiled Soy templates
 * from our output folder.
 *
 * The compiled templates are there because our compileSoy() target is run first
 * in the build.
 *
 * We cannot use standard Soy loaders because:
 *
 * 1) There's only from Atlassian currently maintained
 * 2) Because of the release policy of Soy it's very difficult to make sure we
 *    are using the version we want with the settings we want.
 *
 */

const path = require('path');

const getMergedConfig = require('./getMergedConfig');

module.exports = () => ({apply});

function apply(resolver) {
	const config = getMergedConfig('npmscripts');
	const soyDir = path.join(config.build.temp, 'soy');

	resolver.hooks.describedResolve.tapAsync(
		'resolveSoyTemplates',
		(request, context, callback) => {
			const {path: directory, request: module} = request;

			if (!module.endsWith('.soy') && !module.endsWith('.soy.js')) {
				return callback();
			}

			const modulePath = path.join(directory, module);

			if (!modulePath.startsWith(path.resolve(config.build.input))) {
				return callback();
			}

			const moduleRelativePath = path.relative(
				config.build.input,
				modulePath
			);

			request.path = config.build.input;
			request.request = path.resolve(soyDir, moduleRelativePath);

			return resolver.doResolve(
				resolver.hooks.resolve,
				request,
				null,
				context,
				callback
			);
		}
	);
}
