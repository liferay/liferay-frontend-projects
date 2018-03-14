import path from 'path';
import readJsonSync from 'read-json-sync';
import resolveModule from 'resolve';

/**
 * Recursively find the dependencies of a package and return them as
 * @param {String} basedir directory where package lives in
 * @param {Array} extraDependencies an array of package names to add to
 * 									dependencies collected from package.json
 * @return {Object} a hash of objects where key is the package id and values
 *         have the following structure:
 *           {
 *             id: <package id>,     // a unique `name@version` string
 *             name: <package name>,
 *             version: <package version>,
 *             dir: <package dir>
 *           }
 */
export function getPackageDependencies(basedir, extraDependencies = []) {
	const pkgs = {};

	const packageJson = readJsonSync(path.join(basedir, '/package.json'));
	const pkgId = packageJson.name + '@' + packageJson.version;

	pkgs[pkgId] = {
		id: pkgId,
		name: packageJson.name,
		version: packageJson.version,
		dir: basedir,
	};

	let dependencies = packageJson.dependencies || [];

	dependencies = Object.keys(dependencies);

	dependencies = dependencies.concat(extraDependencies);

	let dependencyDirs = dependencies.map(function(dependency) {
		return resolveDependencyDir(basedir, dependency);
	});

	dependencyDirs = dependencyDirs.filter(dependencyDir => {
		return dependencyDir != null;
	});

	dependencyDirs.forEach(function(dependencyDir) {
		const depPkgs = getPackageDependencies(dependencyDir);

		Object.keys(depPkgs).forEach(function(pkgId) {
			pkgs[pkgId] = depPkgs[pkgId];
		});
	});

	return pkgs;
}

/**
 * Resolves a dependency package and returns its directory.
 * @param {String} packageDir the base directory used for resolution
 * @param {String} dependency a package name
 * @return {String} the path of the directory containing the dependency package
 */
function resolveDependencyDir(packageDir, dependency) {
	const pkgJsonFile = resolveModule.sync(dependency + '/package.json', {
		basedir: packageDir,
	});

	return path.dirname(pkgJsonFile);
}
