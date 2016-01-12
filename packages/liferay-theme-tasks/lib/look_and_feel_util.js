'use strict';

var _ = require('lodash');
var fs = require('fs-extra');
var options = require('../lib/options')();
var path = require('path');
var xml2js = require('xml2js');

var pathSrc = options.pathSrc;

var STR_LOOK_AND_FEEL = 'look-and-feel';

var STR_PORTLET_DECORATOR = 'portlet-decorator';

module.exports = {
	generateLookAndFeelXML: function(xmlString, doctypeElement) {
		return xmlString.replace(/(<\?xml.*>)/, '<?xml version="1.0"?>\n' + doctypeElement + '\n');
	},

	getLookAndFeelDoctype: function(themePath) {
		var xmlString = this.readLookAndFeelXML(themePath);

		var match;

		if (xmlString) {
			match = xmlString.match(/(<!DOCTYPE.*>)/);
		}

		return match ? match[0] : null;
	},

	getLookAndFeelJSON: function(themePath, cb) {
		var xmlString = this.readLookAndFeelXML(themePath);

		if (!xmlString) {
			return cb();
		}

		xml2js.parseString(xmlString, function(err, result) {
			cb(result);
		});
	},

	mergeLookAndFeelJSON: function(themePath, lookAndFeelJSON, cb) {
		var instance = this;

		instance.getLookAndFeelJSON(themePath, function(json) {
			if (_.isEmpty(lookAndFeelJSON)) {
				lookAndFeelJSON = json;
			}
			else if (json) {
				lookAndFeelJSON = instance._mergeJSON(lookAndFeelJSON, json);
			}

			var themeInfo = require(path.join(themePath, 'package.json')).liferayTheme;

			var baseTheme = themeInfo.baseTheme;

			if (_.isObject(baseTheme)) {
				themePath = path.join(themePath, 'node_modules', baseTheme.name);

				instance.mergeLookAndFeelJSON(themePath, lookAndFeelJSON, cb);
			}
			else {
				cb(lookAndFeelJSON);
			}
		});
	},

	readLookAndFeelXML: function(themePath) {
		var xmlString = this._xmlCache[themePath];

		if (xmlString) {
			return xmlString;
		}

		var lookAndFeelDefaultPath = path.join(themePath, 'src/WEB-INF/liferay-look-and-feel.xml');
		var lookAndFeelPath = path.join(themePath, pathSrc, 'WEB-INF/liferay-look-and-feel.xml');

		try {
			fs.statSync(lookAndFeelPath);
		}
		catch (e) {
			lookAndFeelPath = lookAndFeelDefaultPath;
		}

		try {
			xmlString = fs.readFileSync(lookAndFeelPath, 'utf8');

			this._xmlCache[themePath] = xmlString;
		}
		catch (e) {
			console.log(e);
		}

		return xmlString;
	},

	_extractThemeElement: function(obj, key) {
		return obj[STR_LOOK_AND_FEEL].theme[0][key];
	},

	_extractThemeSettings: function(obj) {
		return obj[STR_LOOK_AND_FEEL].theme[0].settings ? obj[STR_LOOK_AND_FEEL].theme[0].settings[0].setting : null;
	},

	_mergeJSON: function(themeObj, baseThemeObj) {
		var themeSettings = this._mergeThemeElementById(this._extractThemeSettings(themeObj), this._extractThemeSettings(baseThemeObj), 'key');
		var themePortletDecorator = this._mergeThemeElementById(this._extractThemeElement(themeObj, STR_PORTLET_DECORATOR), this._extractThemeElement(baseThemeObj, STR_PORTLET_DECORATOR), 'id');

		themeObj[STR_LOOK_AND_FEEL].theme[0].settings = [{
			setting: themeSettings
		}];

		themeObj[STR_LOOK_AND_FEEL].theme[0][STR_PORTLET_DECORATOR] = themePortletDecorator;

		return themeObj;
	},

	_mergeThemeElementById: function(themeElements, baseThemeElements, identifier) {
		if (!themeElements || !baseThemeElements) {
			return themeElements ? themeElements : baseThemeElements;
		}

		var allElements = themeElements.concat(baseThemeElements);
		var elementIds = [];

		return _.reduce(allElements, function(result, item, index) {
			var id = item.$[identifier];

			if (elementIds.indexOf(id) < 0) {
				elementIds.push(id);

				result.push(item);
			}

			return result;
		}, []);
	},

	_xmlCache: {}
};
