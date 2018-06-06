/**
 * Unrolls the imports configuration section of .npmbundlerrc file.
 * @param  {Object} importsConfig the configuration in its original format
 * @return {Object} the unrolled configuration with one entry per module name
 */
export function unrollImportsConfig(importsConfig) {
	importsConfig = importsConfig || {};

	let imports = {};

	Object.keys(importsConfig).forEach(namespace => {
		Object.keys(importsConfig[namespace]).forEach(pkgName => {
			const version = importsConfig[namespace][pkgName];

			if (pkgName === '/') {
				pkgName = namespace;
				namespace = '';
			}

			if (imports[pkgName]) {
				throw new Error(
					`Package ${pkgName} is mapped to more than one import`
				);
			}

			imports[pkgName] = {
				name: namespace,
				version,
			};
		});
	});

	return imports;
}
