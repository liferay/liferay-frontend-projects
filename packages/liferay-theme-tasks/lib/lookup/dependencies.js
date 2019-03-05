function devDependencies(version) {
	const dependencies = {
		gulp: '3.9.1',
		'liferay-theme-tasks': '8.0.0-rc.3',
	};

	if (version === '7.0') {
		dependencies['liferay-theme-deps-7.0'] = '8.0.0-rc.3';
	} else if (version === '7.1') {
		dependencies['liferay-theme-deps-7.1'] = '8.0.0-rc.3';
	} else if (version === '7.2') {
		dependencies['liferay-theme-deps-7.2'] = '8.0.0-rc.3';
	}

	return dependencies;
}

module.exports = {
	devDependencies,
};
