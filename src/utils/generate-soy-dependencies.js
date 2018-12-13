module.exports = function(dependencies) {
	const stringDependencies = dependencies.join('|');

	return `node_modules/+(${stringDependencies})/**/*.soy`;
};
