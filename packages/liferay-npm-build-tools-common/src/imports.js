/**
 * Normalize an imports configuration to canonicalize all syntactic sugar.
 * @param  {Object} importsConfig the configuration in its original format
 * @return {Object} the normalized configuration after resolving all syntactic sugar
 */
export function normalizeImportsConfig(importsConfig) {
	let normalized = {};

	Object.keys(importsConfig).forEach(namespace => {
		Object.keys(importsConfig[namespace]).forEach(pkgName => {
			const version = importsConfig[namespace][pkgName];

			if (pkgName === '/') {
				pkgName = namespace;
				namespace = '';
			}

			normalized[namespace] = normalized[namespace] || {};
			normalized[namespace][pkgName] = version;
		});
	});

	return normalized;
}

/**
 * Unrolls the imports configuration section of .npmbundlerrc file.
 * @param  {Object} importsConfig the configuration in its original format
 * @return {Object} the unrolled configuration with one entry per module name
 */
export function unrollImportsConfig(importsConfig) {
	importsConfig = normalizeImportsConfig(importsConfig || {});

	let imports = {};

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
