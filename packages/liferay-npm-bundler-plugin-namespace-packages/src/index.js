import * as ns from 'liferay-npm-build-tools-common/lib/namespace';

/**
 * @return {void}
 */
export default function({pkg, log, rootPkgJson}, {pkgJson}) {
	if (!pkg.isRoot) {
		pkgJson.name = ns.addNamespace(pkgJson.name, rootPkgJson);

		log.info('namespace-packages', 'Namespaced package');
	}

	pkgJson.dependencies = pkgJson.dependencies || {};

	Object.keys(pkgJson.dependencies).forEach(pkgName => {
		const namespacedPkgName = ns.addNamespace(pkgName, rootPkgJson);
		const version = pkgJson.dependencies[pkgName];

		pkgJson.dependencies[namespacedPkgName] = version;

		delete pkgJson.dependencies[pkgName];
	});

	log.info(
		'namespace-packages',
		'Namespaced',
		Object.keys(pkgJson.dependencies).length,
		'dependencies'
	);
}
