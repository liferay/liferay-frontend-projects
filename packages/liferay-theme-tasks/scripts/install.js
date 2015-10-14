var _ = require('lodash');
var events = require('events');
var exec = require('child_process').exec;
var fs = require('fs');
var lfrThemeConfig = require('../lib/liferay_theme_config');
var path = require('path');
var versionMap = require('../lib/version_map');

var DEFAULT_THEME_CONFIG = {
	baseTheme: 'styled',
	supportCompass: false,
	version: '7.0'
};

var SASS_DEPENDENCIES = {
	libSass: {
		'compass-mixins': '^0.12.7',
		'gulp-sass': '^2.0.0',
		'node-bourbon': '^4.2.3'
	},

	rubySass: {
		'gulp-ruby-sass': '^2.0.4'
	}
};

var STR_STYLED = 'styled';

var STR_UNSTYLED = 'unstyled';

var VERSION_MAP = {
	'6.2': '6.2',
	'7.0': '1.0'
};

var eventEmitter = new events.EventEmitter();

var themeConfig = DEFAULT_THEME_CONFIG;

if (hasParentTheme()) {
	themeConfig = lfrThemeConfig.getConfig(false, path.join(__dirname, '../../../')) || DEFAULT_THEME_CONFIG;
}

var parentLiferayThemeVersion = themeConfig.version;

var themeDependencies = getThemeDependencies(parentLiferayThemeVersion, themeConfig.supportCompass);

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

function getSassDependencies(supportCompass) {
	var dependencyMap = supportCompass ? SASS_DEPENDENCIES.rubySass : SASS_DEPENDENCIES.libSass;

	return _.map(dependencyMap, function(item, index) {
		return index + '@' + item;
	});
}

function getThemeDependencies(version, supportCompass) {
	var versionString = '@^' + VERSION_MAP[version] + '.0';

	var mixins = versionMap.getDependencyName('mixins', version) + versionString;
	var styled = versionMap.getDependencyName('styled', version) + versionString;
	var unstyled = versionMap.getDependencyName('unstyled', version) + versionString;

	var dependencies = getSassDependencies(supportCompass);

	return dependencies.concat([mixins, styled, unstyled]);
}

function hasParentTheme() {
	return fs.existsSync(path.join(__dirname, '../../../package.json'));
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