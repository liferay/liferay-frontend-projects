import * as ns from 'liferay-npm-build-tools-common/lib/namespace';

/**
 * @return {void}
 */
export default function(
	{rootPkgJson, globalConfig, config, log},
	{pkgJson}
) {
	const imports = config.imports || globalConfig.imports || {};

	pkgJson.dependencies = pkgJson.dependencies || {};

	Object.keys(imports).forEach(namespace => {
		Object.keys(imports[namespace]).forEach(pkgName => {
			const localName = ns.addNamespace(pkgName, rootPkgJson);

			const importVersion = imports[namespace][pkgName];
			const importName =
				namespace === ''
					? pkgName
					: ns.addNamespace(pkgName, {name: namespace});

			pkgJson.dependencies[importName] = importVersion;

			if (
				pkgJson.dependencies[localName] !== undefined &&
				pkgJson.dependencies[localName] !== importVersion
			) {
				log.warn(
					'inject-imports-dependencies',
					'Injected dependency',
					`${importName}@${importVersion}`,
					'which is not compatible package.json\'s constraints:',
					`${localName}@${pkgJson.dependencies[localName]}`
				);
			} else {
				log.info(
					'inject-imports-dependencies',
					'Injected dependency',
					`${importName}@${importVersion}`
				);
			}
		});
	});
}
