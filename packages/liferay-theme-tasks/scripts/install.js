var events = require('events');
var fs = require('fs');
var lfrThemeConfig = require('../lib/liferay_theme_config');
var path = require('path');
var themeUtil = require('../lib/util');
var versionMap = require('../lib/version_map');

var DEFAULT_THEME_CONFIG = {
	baseTheme: 'styled',
	supportCompass: false,
	version: '7.0'
};

var STR_UNSTYLED = 'unstyled';

var eventEmitter = new events.EventEmitter();

var themeConfig = DEFAULT_THEME_CONFIG;

if (hasParentTheme()) {
	themeConfig = lfrThemeConfig.getConfig(false, path.join(__dirname, '../../../')) || DEFAULT_THEME_CONFIG;
}

var parentLiferayThemeVersion = themeConfig.version;

function hasParentTheme() {
	return fs.existsSync(path.join(__dirname, '../../../package.json'));
}

function insertInjectTag(dependency, filePath, regex, replacer) {
	filePath = path.join(themeUtil.resolveDependency(versionMap.getDependencyName(dependency, parentLiferayThemeVersion), parentLiferayThemeVersion), filePath);

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
	var templateRegex = '(<\\/body>)';

	var templateReplacer = function(match) {
		return '<!-- inject:js -->\n<!-- endinject -->\n\n' + match;
	};

	insertInjectTag(STR_UNSTYLED, 'templates/portal_normal.vm', templateRegex, templateReplacer);
	insertInjectTag(STR_UNSTYLED, 'templates/portal_normal.ftl', templateRegex, templateReplacer);
}

insertInjectTags();

module.exports = eventEmitter;