var npm = require('npm');
var path = require('path');
var fs = require('fs');

npm.load({
	loaded: false
}, function(err) {
	if (err) throw err;

	var liferayVersion = getParentThemeLiferayVersion();

	var themeDependencies = getThemeDependencies(liferayVersion);

	npm.commands.install(themeDependencies, function(err, data) {
		if (err) throw err;

		npm.emit('dependenciesInstalled');
	});
});

function getParentThemeLiferayVersion() {
	var cwd = process.cwd()

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

module.exports = npm;