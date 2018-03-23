import PkgDesc from 'liferay-npm-build-tools-common/lib/pkg-desc';
import path from 'path';
import readJsonSync from 'read-json-sync';
import resolveModule from 'resolve';

const rootPkgJson = readJsonSync(path.join('.', 'package.json'));
const rootPkg = new PkgDesc(rootPkgJson.name, rootPkgJson.version);

/**
 * Get root package descriptor
 * @return {PkgDesc} the root package descriptor
 */
export function getRootPkg() {
	return rootPkg;
}

/**
 * Recursively find the dependencies of a package and return them as PkgDesc
 * objects.
 * @param {String} basedir directory where package lives in
 * @param {Array} extraDependencies an array of package names to add to
 * 									dependencies collected from package.json
 * @return {Object} a hash of objects where key is the package id and values are PkgDesc objects
 */
export function getPackageDependencies(basedir, extraDependencies = []) {
	const packageJson = readJsonSync(path.join(basedir, '/package.json'));
	const pkg = new PkgDesc(
		packageJson.name,
		packageJson.version,
		basedir == '.' ? null : basedir
	);

	const pkgs = {};
	pkgs[pkg.id] = pkg;

	let dependencies = packageJson.dependencies || [];
	dependencies = Object.keys(dependencies);
	dependencies = dependencies.concat(extraDependencies);

	let dependencyDirs = dependencies
		.map(function(dependency) {
			return resolveDependencyDir(basedir, dependency);
		})
		.filter(dependencyDir => {
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
