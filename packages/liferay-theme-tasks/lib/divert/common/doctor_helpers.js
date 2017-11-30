function checkMissingDeps(dependencies, missingDeps, rubySass, logMissingDeps) {
	missingDeps = logMissingDeps(
		dependencies,
		'liferay-theme-deps-7.0',
		missingDeps
	);

	if (rubySass) {
		missingDeps = logMissingDeps(
			dependencies,
			'gulp-ruby-sass',
			missingDeps
		);
	}

	return missingDeps;
}

module.exports = {checkMissingDeps};
