'use strict';

let _ = require('lodash');
let fs = require('fs-extra');
let path = require('path');
let util = require('util');
let xml2js = require('xml2js');

let options = require('../lib/options')();

let pathSrc = options.pathSrc;

let QUERY_ELEMENTS = {
	'color-scheme': 'id',
	'layout-templates.0.custom.0.layout-template': 'id',
	'layout-templates.0.standard.0.layout-template': 'id',
	'portlet-decorator': 'id',
	'roles': 'single',
	'settings.0.setting': 'key',
};

let STR_LOOK_AND_FEEL = 'look-and-feel';

let THEME_CHILD_ORDER = [
	'$',
	'root-path',
	'templates-path',
	'css-path',
	'images-path',
	'javascript-path',
	'virtual-path',
	'template-extension',
	'settings',
	'control-panel-theme',
	'page-theme',
	'wap-theme',
	'roles',
	'color-scheme',
	'layout-templates',
	'portlet-decorator',
];

module.exports = {
	buildXML: function(lookAndFeelJSON, doctypeElement) {
		let themeQuery = 'look-and-feel.theme.0';

		let themeElement = _.get(lookAndFeelJSON, themeQuery);

		themeElement = _.reduce(
			THEME_CHILD_ORDER,
			function(result, item) {
				if (themeElement[item]) {
					result[item] = themeElement[item];
				}

				return result;
			},
			{}
		);

		_.set(lookAndFeelJSON, themeQuery, themeElement);

		let builder = new xml2js.Builder({
			renderOpts: {
				indent: '\t',
				pretty: true,
			},
			xmldec: {
				encoding: null,
				standalone: null,
			},
		});

		let xml = builder.buildObject(lookAndFeelJSON);

		xml = xml.replace(/(<\?xml.*>)/, '$1\n' + doctypeElement + '\n');

		return xml;
	},

	correctJSONIdentifiers: function(lookAndFeelJSON, name) {
		let themeAttrs = lookAndFeelJSON[STR_LOOK_AND_FEEL].theme[0].$;

		if (name !== themeAttrs.name) {
			themeAttrs.name = name;
			themeAttrs.id = _.kebabCase(name);
		}

		return lookAndFeelJSON;
	},

	getLookAndFeelDoctype: function(themePath) {
		let xmlString = this.readLookAndFeelXML(themePath);

		let match;

		if (xmlString) {
			match = xmlString.match(/(<!DOCTYPE.*>)/);
		}

		return match ? match[0] : null;
	},

	getLookAndFeelDoctypeByVersion: function(version) {
		version += '.0';

		return util.format(
			'<!DOCTYPE look-and-feel PUBLIC "-//Liferay//DTD Look and Feel %s//EN" "http://www.liferay.com/dtd/liferay-look-and-feel_%s.dtd">',
			version,
			version.replace(/\./g, '_')
		);
	},

	getLookAndFeelJSON: function(themePath, cb) {
		let xmlString = this.readLookAndFeelXML(themePath);

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
		let pluginPackageProperties = fs.readFileSync(
			path.join(
				themePath,
				pathSrc,
				'WEB-INF',
				'liferay-plugin-package.properties'
			),
			{
				encoding: 'utf8',
			}
		);

		let match = pluginPackageProperties.match(/name=(.*)/);

		return match ? match[1] : null;
	},

	mergeLookAndFeelJSON: function(themePath, lookAndFeelJSON, cb) {
		let instance = this;

		instance.getLookAndFeelJSON(themePath, function(json) {
			if (_.isEmpty(lookAndFeelJSON)) {
				lookAndFeelJSON = json;
			} else if (json) {
				lookAndFeelJSON = instance._mergeJSON(lookAndFeelJSON, json);
			}

			let themeInfo = require(path.join(themePath, 'package.json'))
				.liferayTheme;

			let baseTheme = themeInfo.baseTheme;

			if (_.isObject(baseTheme)) {
				themePath = path.join(
					themePath,
					'node_modules',
					baseTheme.name
				);

				instance.mergeLookAndFeelJSON(themePath, lookAndFeelJSON, cb);
			} else {
				cb(lookAndFeelJSON);
			}
		});
	},

	readLookAndFeelXML: function(themePath) {
		let xmlString = this._xmlCache[themePath];

		if (xmlString) {
			return xmlString;
		}

		let lookAndFeelDefaultPath = path.join(
			themePath,
			'src/WEB-INF/liferay-look-and-feel.xml'
		);
		let lookAndFeelPath = path.join(
			themePath,
			pathSrc,
			'WEB-INF/liferay-look-and-feel.xml'
		);

		try {
			fs.statSync(lookAndFeelPath);
		} catch (err) {
			lookAndFeelPath = lookAndFeelDefaultPath;
		}

		try {
			xmlString = fs.readFileSync(lookAndFeelPath, 'utf8');

			this._xmlCache[themePath] = xmlString;
		} catch (err) {}

		return xmlString;
	},

	_extractThemeElement: function(obj, key) {
		return obj[STR_LOOK_AND_FEEL].theme[0][key];
	},

	_mergeJSON: function(themeObj, baseThemeObj) {
		let instance = this;

		_.forEach(QUERY_ELEMENTS, function(item, index) {
			let mergedElement;
			let queryString = 'look-and-feel.theme.0.' + index;

			let baseThemeElement = _.get(baseThemeObj, queryString);
			let themeElement = _.get(themeObj, queryString);

			if (item === 'value') {
				mergedElement = instance._mergeThemeElementByValue(
					themeElement,
					baseThemeElement
				);
			} else if (item === 'single') {
				mergedElement = themeElement || baseThemeElement;
			} else {
				mergedElement = instance._mergeThemeElementById(
					themeElement,
					baseThemeElement,
					item
				);
			}

			if (mergedElement) {
				_.set(themeObj, queryString, mergedElement);
			}
		});

		return themeObj;
	},

	_mergeThemeElementById: function(
		themeElements,
		baseThemeElements,
		identifier
	) {
		if (!themeElements || !baseThemeElements) {
			return themeElements ? themeElements : baseThemeElements;
		}

		identifier = identifier || 'id';

		let allElements = themeElements.concat(baseThemeElements);
		let elementIds = [];

		return _.reduce(
			allElements,
			function(result, item) {
				let id = item.$[identifier];

				if (elementIds.indexOf(id) < 0) {
					elementIds.push(id);

					result.push(item);
				}

				return result;
			},
			[]
		);
	},

	_mergeThemeElementByValue: function(themeElements, baseThemeElements) {
		if (!themeElements || !baseThemeElements) {
			return themeElements ? themeElements : baseThemeElements;
		}

		return _.uniq(themeElements.concat(baseThemeElements));
	},

	_xmlCache: {},
};
