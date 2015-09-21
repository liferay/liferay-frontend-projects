var events = require('events');
var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var versionMap = require('../lib/version_map');

var VERSION_MAP = {
	'6.2': '6.2',
	'7.0': '1.0'
};

var eventEmitter = new events.EventEmitter();

var themeDependencies = getThemeDependencies(getParentThemeLiferayVersion());

var child = exec(
	'npm install ' + themeDependencies.join(' '),
	function (err, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);

		if (err) throw err;

		insertUnstyledInjectTags();

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
	var versionString = '@^' + VERSION_MAP[version] + '.0';

	var mixins = versionMap.getDependencyName('mixins', version) + versionString;
	var styled = versionMap.getDependencyName('styled', version) + versionString;
	var unstyled = versionMap.getDependencyName('unstyled', version) + versionString;

	return [mixins, styled, unstyled];
}

function insertUnstyledInjectTag(filePath, regex, replacer) {
	filePath = path.join(__dirname, '../node_modules', versionMap.getDependencyName('unstyled'), filePath);

	var fileContents = fs.readFileSync(filePath, {
		encoding: 'utf8'
	});

	regex = new RegExp(regex, 'g');

	fileContents = fileContents.replace(regex, replacer);

	fs.writeFileSync(filePath, fileContents, {
		encoding: 'utf8'
	});
}

function insertUnstyledInjectTags() {
	insertUnstyledInjectTag('css/main.scss', '(@import\\s"custom";)', function(match) {
		return '/* inject:imports */\n/* endinject */\n\n' + match;
	});

	var templateRegex = '(<\\/body>)';

	var templateReplacer = function(match) {
		return '<!-- inject:js -->\n<!-- endinject -->\n\n' + match;
	};

	insertUnstyledInjectTag('templates/portal_normal.vm', templateRegex, templateReplacer);
	insertUnstyledInjectTag('templates/portal_normal.ftl', templateRegex, templateReplacer);
}

module.exports = eventEmitter;