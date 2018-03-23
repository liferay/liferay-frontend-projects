/**
 * Test if a module name is namespaced according to root package.
 * @param {String} moduleName a module name
 * @param {Object} rootPkgJson root project's package.json
 * @return {Boolean} true if the module is namespaced
 */
export function isNamespaced(moduleName, rootPkgJson) {
	const namespace = getNamespace(rootPkgJson);

	return (
		moduleName.startsWith(namespace) ||
		moduleName.startsWith(`@${namespace}`)
	);
}

/**
 * Namespace a module name according to its root project's package.json.
 * @param {String} moduleName a module name
 * @param {Object} rootPkgJson root project's package.json
 * @return {String} the namespaced module name
 */
export function addNamespace(moduleName, rootPkgJson) {
	if (!isNamespaced(moduleName, rootPkgJson)) {
		const namespace = getNamespace(rootPkgJson);

		if (moduleName.startsWith('@')) {
			return moduleName.replace('@', `@${namespace}`);
		} else {
			return namespace + moduleName;
		}
	}

	return moduleName;
}

/**
 * Un-namespace a module name according to its root project's package.json.
 * @param {String} moduleName a module name
 * @param {Object} rootPkgJson root project's package.json
 * @return {String} the un-namespaced module name
 */
export function removeNamespace(moduleName, rootPkgJson) {
	if (isNamespaced(moduleName, rootPkgJson)) {
		const namespace = getNamespace(rootPkgJson);

		if (moduleName.startsWith('@')) {
			return moduleName.replace(`@${namespace}`, '@');
		} else {
			return moduleName.substring(namespace.length);
		}
	}

	return moduleName;
}

/**
 * Get the namespace of modules according to their root project's package.json.
 * @param {Object} rootPkgJson root project's package.json
 * @return {String} the namespace for modules
 */
export function getNamespace(rootPkgJson) {
	if (!rootPkgJson || !rootPkgJson.name || !rootPkgJson.version) {
		throw new Error('Invalid root pacakge.json object');
	}

	return rootPkgJson.name + '$' + rootPkgJson.version + '$';
}
