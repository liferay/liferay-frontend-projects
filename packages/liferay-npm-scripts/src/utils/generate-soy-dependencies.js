/**
 * Helper to generate string glob of soy dependencies
 * @param {Array.<string>} dependencies
 * @returns {string}
 */
module.exports = function(dependencies) {
	const stringDependencies = dependencies.join('|');

	return `node_modules/+(${stringDependencies})/**/*.soy`;
};
