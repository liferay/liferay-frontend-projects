var events = require('events');
var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var versionMap = require('../lib/version_map');

var STR_STYLED = 'styled';

var STR_UNSTYLED = 'unstyled';

var VERSION_MAP = {
	'6.2': '6.2',
	'7.0': '1.0'
};

var eventEmitter = new events.EventEmitter();

var parentLiferayThemeVersion = getParentThemeLiferayVersion();

var themeDependencies = getThemeDependencies(parentLiferayThemeVersion);

var child = exec(
	'npm install ' + themeDependencies.join(' '),
	function (err, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);

		if (err) throw err;

		insertInjectTags();

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

function insertInjectTag(dependency, filePath, regex, replacer) {
	filePath = path.join(__dirname, '../node_modules', versionMap.getDependencyName(dependency, parentLiferayThemeVersion), filePath);

	var fileContents = fs.readFileSync(filePath, {
		encoding: 'utf8'
	});

	regex = new RegExp(regex, 'g');

	fileContents = fileContents.replace(regex, replacer);

	fs.writeFileSync(filePath, fileContents, {
		encoding: 'utf8'
	});
}

function insertInjectTags() {
	var cssRegex = '(@import\\s"custom";)';

	var cssReplacer = function(match) {
		return '/* inject:imports */\n/* endinject */\n\n' + match;
	};

	var cssFile = parentLiferayThemeVersion == '7.0' ? 'css/main.scss' : 'css/main.css';

	insertInjectTag(STR_STYLED, cssFile, cssRegex, cssReplacer);
	insertInjectTag(STR_UNSTYLED, cssFile, cssRegex, cssReplacer);

	var templateRegex = '(<\\/body>)';

	var templateReplacer = function(match) {
		return '<!-- inject:js -->\n<!-- endinject -->\n\n' + match;
	};

	insertInjectTag(STR_UNSTYLED, 'templates/portal_normal.vm', templateRegex, templateReplacer);
	insertInjectTag(STR_UNSTYLED, 'templates/portal_normal.ftl', templateRegex, templateReplacer);
}

module.exports = eventEmitter;