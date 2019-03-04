/**
 * A class to resolve paths inside modules.
 */
export default class PathResolver {
	/**
	 * Resolves the path of module
	 * @param {string} root root path which will be used as reference to resolve
	 *     						the path of the dependency
	 * @param {string} dependency the dependency path, which has to be
	 *     							resolved
	 * @return {string} the resolved dependency path.
	 */
	resolvePath(root, dependency) {
		if (
			dependency === 'require' ||
			dependency === 'exports' ||
			dependency === 'module' ||
			!(dependency.indexOf('.') === 0 || dependency.indexOf('..') === 0)
		) {
			return dependency;
		}

		// Split module directories
		let moduleParts = root.split('/');

		// Remove module name
		moduleParts.splice(-1, 1);

		// Split dependency directories
		const dependencyParts = dependency.split('/');

		// Extract dependency name
		const dependencyName = dependencyParts.splice(-1, 1);

		for (let i = 0; i < dependencyParts.length; i++) {
			const dependencyPart = dependencyParts[i];

			if (dependencyPart === '.') {
				continue;
			} else if (dependencyPart === '..') {
				if (moduleParts.length) {
					moduleParts.splice(-1, 1);
				} else {
					moduleParts = moduleParts.concat(dependencyParts.slice(i));

					break;
				}
			} else {
				moduleParts.push(dependencyPart);
			}
		}

		moduleParts.push(dependencyName);

		return moduleParts.join('/');
	}
}
