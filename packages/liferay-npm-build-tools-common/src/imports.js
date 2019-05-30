/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Normalize an imports configuration to canonicalize all syntactic sugar.
 * @param  {Object} importsConfig the configuration in its original format
 * @param  {Boolean} useSlashFormat whether to use slash or empty string format
 * @return {Object} the normalized configuration after resolving all syntactic sugar
 */
export function normalizeImportsConfig(importsConfig, useSlashFormat = false) {
	const normalized = {};

	// Normalize to empty-string format
	Object.keys(importsConfig).forEach(namespace => {
		Object.keys(importsConfig[namespace]).forEach(pkgName => {
			const version = importsConfig[namespace][pkgName];
			let normalizedSpace = namespace;

			if (pkgName === '/') {
				pkgName = namespace;
				normalizedSpace = '';
			}

			normalized[normalizedSpace] = normalized[normalizedSpace] || {};
			normalized[normalizedSpace][pkgName] = version;
		});
	});

	// If necessary convert back to slash format
	if (useSlashFormat) {
		Object.keys(normalized).forEach(namespace => {
			Object.keys(normalized[namespace]).forEach(pkgName => {
				if (namespace === '') {
					normalized[pkgName] = normalized[pkgName] || {};
					normalized[pkgName]['/'] = normalized[namespace][pkgName];

					delete normalized[namespace][pkgName];

					if (Object.keys(normalized[namespace]).length == 0) {
						delete normalized[namespace];
					}
				}
			});
		});
	}

	return normalized;
}

/**
 * Unrolls the imports configuration section of .npmbundlerrc file.
 * @param  {Object} importsConfig the configuration in its original format
 * @return {Object} the unrolled configuration with one entry per module name
 */
export function unrollImportsConfig(importsConfig) {
	importsConfig = normalizeImportsConfig(importsConfig || {});

	const imports = {};

	Object.keys(importsConfig).forEach(namespace => {
		Object.keys(importsConfig[namespace]).forEach(pkgName => {
			if (imports[pkgName]) {
				throw new Error(
					`Package ${pkgName} is mapped to more than one import`
				);
			}

			imports[pkgName] = {
				name: namespace,
				version: importsConfig[namespace][pkgName],
			};
		});
	});

	return imports;
}
