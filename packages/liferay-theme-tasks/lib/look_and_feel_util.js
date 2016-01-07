'use strict';

var _ = require('lodash');
var fs = require('fs-extra');
var options = require('../lib/options')();
var path = require('path');
var xml2js = require('xml2js');
var xmlmerge = require('xmlmerge-js');

var pathSrc = options.pathSrc;

var xmlCache = {};

var STR_LOOK_AND_FEEL = 'look-and-feel';

var STR_PORTLET_DECORATOR = 'portlet-decorator';

module.exports = {
	extractThemeElement: function(obj, key) {
		return obj[STR_LOOK_AND_FEEL].theme[0][key];
	},

	extractThemeSettings: function(obj) {
		return obj[STR_LOOK_AND_FEEL].theme[0].settings[0].setting;
	},

	generateLookAndFeelXML: function(xmlString, doctypeElement) {
		return xmlString.replace(/(<\?xml.*>)/, '<?xml version="1.0"?>\n' + doctypeElement + '\n');
	},

	getLookAndFeelDoctype: function(themePath) {
		var xmlString = this.readLookAndFeelXML(themePath);

		var match = xmlString.match(/(<!DOCTYPE.*>)/);

		return match[0];
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

	mergeJSON: function(themeObj, baseThemeObj) {
		var themeSettings = this.mergeThemeElementById(
			this.extractThemeSettings(themeObj),
			this.extractThemeSettings(baseThemeObj),
			function(item) {
				return item.$.key;
			}
		);

		var themePortletDecorator = this.mergeThemeElementById(
			this.extractThemeElement(themeObj, STR_PORTLET_DECORATOR),
			this.extractThemeElement(baseThemeObj, STR_PORTLET_DECORATOR),
			function(item) {
				return item.$.id;
			}
		);

		themeObj[STR_LOOK_AND_FEEL].theme[0].settings = [{
			setting: themeSettings
		}];

		themeObj[STR_LOOK_AND_FEEL].theme[0][STR_PORTLET_DECORATOR] = themePortletDecorator;

		return themeObj;
	},

	mergeThemeElementById: function(themeElements, baseThemeElements, identifier) {
		if (!themeElements || !baseThemeElements) {
			return themeElements ? themeElements : baseThemeElements;
		}

		var allElements = themeElements.concat(baseThemeElements);
		var elementIds = [];

		return _.reduce(allElements, function(result, item, index) {
			var id = identifier(item);

			if (elementIds.indexOf(id) < 0) {
				elementIds.push(id);

				result.push(item);
			}

			return result;
		}, []);
	},

	mergeLookAndFeelJSON: function(themePath, lookAndFeelJSON, cb) {
		var instance = this;

		instance.getLookAndFeelJSON(themePath, function(json) {
			if (_.isEmpty(lookAndFeelJSON)) {
				lookAndFeelJSON = json;
			}
			else if (json) {
				lookAndFeelJSON = instance.mergeJSON(lookAndFeelJSON, json);
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
		var xmlString = xmlCache[themePath];

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

			xmlCache[themePath] = xmlString;
		}
		catch (e) {
			console.log(e);
		}

		return xmlString;
	}
};
