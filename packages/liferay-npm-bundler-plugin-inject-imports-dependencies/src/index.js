import * as ns from 'liferay-npm-build-tools-common/lib/namespace';

/**
 * @return {void}
 */
export default function({globalConfig, config, log}, {pkgJson}) {
	const imports = config.imports || globalConfig.imports || {};

	pkgJson.dependencies = pkgJson.dependencies || {};

	Object.keys(imports).forEach(namespace => {
		Object.keys(imports[namespace]).forEach(pkgName => {
			const version = imports[namespace][pkgName];
			const name = ns.addNamespace(pkgName, {name: namespace});

			pkgJson.dependencies[name] = version;

			log.info(
				'inject-imports-dependencies',
				'Injected dependency',
				`${name} : ${version}`
			);
		});
	});
}
