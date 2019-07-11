/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * This transform allows tests to require files of the form "Foo.soy"
 * from other projects without blowing up, by substituting no-op
 * templates that can be safely passed to `Soy.register()`.
 *
 * In tests that exercise their own project's Soy templates, we already build
 * corresponding "Foo.soy.js" files and have mappings configured so that Jest
 * can resolve them.
 */
module.exports = {
	canInstrument: true,

	getCacheKey(_src, file, _configString, _options) {
		return file;
	},

	process(_src, _file) {
		return `
			const render = () => {};

			const templates = {render};

			module.exports = templates;
		`;
	}
};
