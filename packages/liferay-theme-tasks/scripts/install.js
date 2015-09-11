var events = require('events');
var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');

var eventEmitter = new events.EventEmitter();

var themeDependencies = getThemeDependencies(getParentThemeLiferayVersion());

var child = exec(
	'npm install ' + themeDependencies.join(' '),
	function (err, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);

		if (err) throw err;

		eventEmitter.emit('dependenciesInstalled');
	}
);

function getParentThemeLiferayVersion() {
	var cwd = process.cwd();

	var parentThemePackageJSON = path.resolve(cwd, '../../', 'package.json');

	var liferayVersion = '7.0';

	if (fs.existsSync(parentThemePackageJSON)) {
		var packageJSON = require(parentThemePackageJSON);

		liferayVersion = (packageJSON.liferayTheme && packageJSON.liferayTheme.version) ? packageJSON.liferayTheme.version : liferayVersion;
	}

	return liferayVersion;
}

function getThemeDependencies(version) {
	var versionString = '@^' + version + '.0';

	var mixins = 'liferay-theme-mixins' + versionString;
	var styled = 'liferay-theme-styled' + versionString;
	var unstyled = 'liferay-theme-unstyled' + versionString;

	return [mixins, styled, unstyled];
}

module.exports = eventEmitter;