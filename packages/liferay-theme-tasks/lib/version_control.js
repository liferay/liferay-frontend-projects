'use strict';

var chalk = require('gulp-util').colors;
var compareVersion = require('compare-version');
var liferayThemeTasksPackageJson = require('../package.json');
var packageJson = require('package-json');

module.exports = function() {
	var currentVersion = liferayThemeTasksPackageJson.version;
	var packageName = liferayThemeTasksPackageJson.name;

	packageJson(packageName, 'latest', function (err, json) {
		var seperator = chalk.yellow('----------------------------------------------------------------');
		var space = ' ';

		if (compareVersion(currentVersion, json.version)) {
			console.log(seperator);
			console.log(space, 'You are running an old version of', chalk.cyan(packageName));
			console.log(space, 'Run', chalk.cyan('npm update', packageName), 'to install newest version');
			console.log(space, 'Current version:', chalk.green(currentVersion), space, 'Latest version:', chalk.green(json.version));
			console.log(seperator);
		}
	});
}