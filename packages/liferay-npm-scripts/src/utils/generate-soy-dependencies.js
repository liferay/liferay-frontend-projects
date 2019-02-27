const path = require('path');

/**
 * Helper to generate string glob of soy dependencies
 * @param {Array.<string>} dependencies
 * @returns {string}
 */
module.exports = function(dependencies) {
	const stringDependencies = dependencies.map(
		function(dependency) {
			let resolvedDependency = null;

			try {
				// Requires the `package.json` file to avoid resolving
				// the main entry point of the package so we can safely
				// infer the directory from the package root
				resolvedDependency = path.dirname(
					require.resolve(`${dependency}/package.json`)
				);
			}
			catch (err) {}

			return resolvedDependency;
		})
		.filter(Boolean)
		.join(',');

	return `{${stringDependencies}}/**/*.soy`;
};
