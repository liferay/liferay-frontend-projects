'use strict';

var _ = require('lodash');
var fs = require('fs-extra');
var path = require('path');
var util = require('util');
var xml2js = require('xml2js');

var options = require('../lib/options')();

var pathSrc = options.pathSrc;

var QUERY_ELEMENTS = {
	'color-scheme': 'id',
	'layout-templates.0.custom.0.layout-template': 'id',
	'layout-templates.0.standard.0.layout-template': 'id',
	'portlet-decorator': 'id',
	'roles': 'single',
	'settings.0.setting': 'key'
};

var STR_LOOK_AND_FEEL = 'look-and-feel';

var THEME_CHILD_ORDER = ['$', 'root-path', 'templates-path', 'css-path', 'images-path', 'javascript-path', 'virtual-path', 'template-extension', 'settings', 'control-panel-theme', 'page-theme', 'wap-theme', 'roles', 'color-scheme', 'layout-templates', 'portlet-decorator'];

module.exports = {
	buildXML: function(lookAndFeelJSON, doctypeElement) {
		var themeQuery = 'look-and-feel.theme.0';

		var themeElement = _.get(lookAndFeelJSON, themeQuery);

		themeElement = _.reduce(THEME_CHILD_ORDER, function(result, item) {
			if (themeElement[item]) {
				result[item] = themeElement[item];
			}

			return result;
		}, {});

		_.set(lookAndFeelJSON, themeQuery, themeElement);

		var builder = new xml2js.Builder({
			renderOpts: {
				indent: '\t',
				pretty: true
			},
			xmldec: {
				encoding: null,
				standalone: null
			}
		});

		var xml = builder.buildObject(lookAndFeelJSON);

		xml = xml.replace(/(<\?xml.*>)/, '$1\n' + doctypeElement + '\n');

		return xml;
	},

	correctJSONIdentifiers: function(lookAndFeelJSON, name) {
		var themeAttrs = lookAndFeelJSON[STR_LOOK_AND_FEEL].theme[0].$;

		if (name !== themeAttrs.name) {
			themeAttrs.name = name;
			themeAttrs.id = _.kebabCase(name);
		}

		return lookAndFeelJSON;
	},

	getLookAndFeelDoctype: function(themePath) {
		var xmlString = this.readLookAndFeelXML(themePath);

		var match;

		if (xmlString) {
			match = xmlString.match(/(<!DOCTYPE.*>)/);
		}

		return match ? match[0] : null;
	},

	getLookAndFeelDoctypeByVersion: function(version) {
		version += '.0';

		return util.format('<!DOCTYPE look-and-feel PUBLIC "-//Liferay//DTD Look and Feel %s//EN" "http://www.liferay.com/dtd/liferay-look-and-feel_%s.dtd">', version, version.replace(/\./g, '_'));
	},

	getLookAndFeelJSON: function(themePath, cb) {
		var xmlString = this.readLookAndFeelXML(themePath);

		if (!xmlString) {
			return cb();
		}

		xml2js.parseString(xmlString, function(err, result) {
			if (err) {
				throw err;
			}

			cb(result);
		});
	},

	getNameFromPluginPackageProperties: function(themePath) {
		var pluginPackageProperties = fs.readFileSync(path.join(themePath, pathSrc, 'WEB-INF', 'liferay-plugin-package.properties'), {
			encoding: 'utf8'
		});

		var match = pluginPackageProperties.match(/name=(.*)/);

		return match ? match[1] : null;
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
		catch (err) {
			lookAndFeelPath = lookAndFeelDefaultPath;
		}

		try {
			xmlString = fs.readFileSync(lookAndFeelPath, 'utf8');

			this._xmlCache[themePath] = xmlString;
		}
		catch (err) {
		}

		return xmlString;
	},

	_extractThemeElement: function(obj, key) {
		return obj[STR_LOOK_AND_FEEL].theme[0][key];
	},

	_mergeJSON: function(themeObj, baseThemeObj) {
		var instance = this;

		_.forEach(QUERY_ELEMENTS, function(item, index) {
			var mergedElement;
			var queryString = 'look-and-feel.theme.0.' + index;

			var baseThemeElement = _.get(baseThemeObj, queryString);
			var themeElement = _.get(themeObj, queryString);

			if (item === 'value') {
				mergedElement = instance._mergeThemeElementByValue(themeElement, baseThemeElement);
			}
			else if (item === 'single') {
				mergedElement = themeElement || baseThemeElement;
			}
			else {
				mergedElement = instance._mergeThemeElementById(themeElement, baseThemeElement, item);
			}

			if (mergedElement) {
				_.set(themeObj, queryString, mergedElement);
			}
		});

		return themeObj;
	},

	_mergeThemeElementById: function(themeElements, baseThemeElements, identifier) {
		if (!themeElements || !baseThemeElements) {
			return themeElements ? themeElements : baseThemeElements;
		}

		identifier = identifier || 'id';

		var allElements = themeElements.concat(baseThemeElements);
		var elementIds = [];

		return _.reduce(allElements, function(result, item) {
			var id = item.$[identifier];

			if (elementIds.indexOf(id) < 0) {
				elementIds.push(id);

				result.push(item);
			}

			return result;
		}, []);
	},

	_mergeThemeElementByValue: function(themeElements, baseThemeElements) {
		if (!themeElements || !baseThemeElements) {
			return themeElements ? themeElements : baseThemeElements;
		}

		return _.uniq(themeElements.concat(baseThemeElements));
	},

	_xmlCache: {}
};
