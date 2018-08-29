const version = process.argv[3];

module.exports = {
	files: [
		'packages/generator-liferay-theme/generators/**/*',
		'packages/generator-liferay-theme/lib/!(__tests__)/**/*',
		'packages/liferay-theme-tasks/lib/!(__tests__)/**/*',
	],
	from: [
		/"liferay-theme-deps-7.(\d)": ".*"/g,
		/"liferay-theme-tasks": ".*"/g,
		/'liferay-theme-deps-7.(\d)': '.*'/g,
		/'liferay-theme-tasks': '.*'/g,
	],
	to: [
		`"liferay-theme-deps-7.$1": "${version}"`,
		`"liferay-theme-tasks": "${version}"`,
		`'liferay-theme-deps-7.$1': '${version}'`,
		`'liferay-theme-tasks': '${version}'`,
	],
};