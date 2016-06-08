'use strict';

var _ = require('lodash');
var fs = require('fs-extra');
var path = require('path');
var sinon = require('sinon');
var test = require('ava');

var options = require('../../lib/options')({
	pathSrc: './custom_src_path'
});
var testUtil = require('../util');

var lookAndFeelUtil = require('../../lib/look_and_feel_util.js');

var baseLookAndFeelJSON = require('../fixtures/json/base-look-and-feel.json');
var mixedLookAndFeelJSON = require('../fixtures/json/mixed-look-and-feel.json');

var baseThemePath = path.join(__dirname, '../fixtures/themes/7.0/base-theme');

test('lookAndFeelUtil should sort json correctly and build valid xml', function(t) {
	var xml = testUtil.stripNewlines(lookAndFeelUtil.buildXML(mixedLookAndFeelJSON, lookAndFeelUtil.getLookAndFeelDoctypeByVersion('7.0')));

	var xmlFileContent = testUtil.stripNewlines(fs.readFileSync(path.join(__dirname, '../fixtures/xml/liferay-look-and-feel.xml'), {
		encoding: 'utf8'
	}));

	t.is(xml, xmlFileContent);
});

test('correctJSONIdentifiers should set the theme element id and name attribute if the name argument is different - for themes that do not have a look-and-feel.xml', function(t) {
	lookAndFeelUtil.correctJSONIdentifiers(baseLookAndFeelJSON, 'Test Name');

	t.is(_.get(baseLookAndFeelJSON, 'look-and-feel.theme.0.$.id'), 'test-name');
	t.is(_.get(baseLookAndFeelJSON, 'look-and-feel.theme.0.$.name'), 'Test Name');

	lookAndFeelUtil.correctJSONIdentifiers(baseLookAndFeelJSON, 'Base Theme');

	t.is(_.get(baseLookAndFeelJSON, 'look-and-feel.theme.0.$.id'), 'base-theme');
	t.is(_.get(baseLookAndFeelJSON, 'look-and-feel.theme.0.$.name'), 'Base Theme');
});

test('getLookAndFeelDoctype should extract doctype from liferay-look-and-feel.xml', function(t) {
	var doctype = lookAndFeelUtil.getLookAndFeelDoctype(baseThemePath);

	t.is(doctype, '<!DOCTYPE look-and-feel PUBLIC "-//Liferay//DTD Look and Feel 7.0.0//EN" "http://www.liferay.com/dtd/liferay-look-and-feel_7_0_0.dtd">');
});

test('getLookAndFeelDoctypeByVersion should generate correct doctype string based on version', function(t) {
	var doctype = lookAndFeelUtil.getLookAndFeelDoctypeByVersion('7.0');

	t.is(doctype, '<!DOCTYPE look-and-feel PUBLIC "-//Liferay//DTD Look and Feel 7.0.0//EN" "http://www.liferay.com/dtd/liferay-look-and-feel_7_0_0.dtd">');

	doctype = lookAndFeelUtil.getLookAndFeelDoctypeByVersion('6.2');

	t.is(doctype, '<!DOCTYPE look-and-feel PUBLIC "-//Liferay//DTD Look and Feel 6.2.0//EN" "http://www.liferay.com/dtd/liferay-look-and-feel_6_2_0.dtd">');
});

test.cb('getLookAndFeelJSON should convert look-and-feel xml to json', function(t) {
	lookAndFeelUtil.getLookAndFeelJSON(baseThemePath, function(result) {
		t.truthy(result);
		t.truthy(result['look-and-feel']);

		t.end();
	});
});

test.cb('mergeLookAndFeelJSON should merge look and feel json', function(t) {
	lookAndFeelUtil.mergeLookAndFeelJSON(baseThemePath, {}, function(result) {
		t.truthy(result);
		t.truthy(result['look-and-feel']);

		t.deepEqual(result, require('../fixtures/json/merged-look-and-feel.json'));

		t.end();
	});
});

test('readLookAndFeelXML should return xml and access file only once', function(t) {
	// erase cache for sinon spy
	lookAndFeelUtil._xmlCache = {};

	var spy = sinon.spy(fs, 'readFileSync');

	var xml = lookAndFeelUtil.readLookAndFeelXML(baseThemePath);
	xml = lookAndFeelUtil.readLookAndFeelXML(baseThemePath);

	t.truthy(/<look-and-feel>/.test(xml));
	t.truthy(spy.calledOnce);
});

test.cb('_extractThemeElement should extract elements based on tag name', function(t) {
	lookAndFeelUtil.getLookAndFeelJSON(baseThemePath, function(result) {
		var portletDecorators = lookAndFeelUtil._extractThemeElement(result, 'portlet-decorator');

		t.is(portletDecorators.length, 2);
		t.is(portletDecorators[0].$.id, 'portlet-decorator-1');
		t.is(portletDecorators[1].$.id, 'portlet-decorator-2');

		t.end();
	});
});

test('_mergeJSON should merge look-and-feel json and output a valid look-and-feel json object', function(t) {
	var lookAndFeelJSON = lookAndFeelUtil._mergeJSON(baseLookAndFeelJSON, baseLookAndFeelJSON);

	t.deepEqual(lookAndFeelJSON, baseLookAndFeelJSON);

	var parentLookAndFeelJSON = require('../fixtures/json/parent-look-and-feel.json');

	lookAndFeelJSON = lookAndFeelUtil._mergeJSON(baseLookAndFeelJSON, parentLookAndFeelJSON);

	t.deepEqual(lookAndFeelJSON, require('../fixtures/json/merged-look-and-feel.json'));
});

var elements1 = [{
	$: {
		id: 'one'
	}
},
{
	$: {
		id: 'two'
	}
}];
var elements2 = [{
	$: {
		id: 'two'
	}
},
{
	$: {
		id: 'three'
	}
}];

test('_mergeThemeElementById should return null if both arrays are null', function(t) {
	var mergedElements = lookAndFeelUtil._mergeThemeElementById(null, null);

	t.is(mergedElements, null);
});

test('_mergeThemeElementById should return non null array if one of the arrays is null', function(t) {
	var mergedElements = lookAndFeelUtil._mergeThemeElementById(elements1, null);

	t.is(mergedElements, elements1);

	mergedElements = lookAndFeelUtil._mergeThemeElementById(null, elements2);

	t.is(mergedElements, elements2);
});

test('_mergeThemeElementById should merge arrays and exclude repeated elements according to id', function(t) {
	var mergedElements = lookAndFeelUtil._mergeThemeElementById(elements1, elements2);

	t.deepEqual(mergedElements, [{
		$: {
			id: 'one'
		}
	},
	{
		$: {
			id: 'two'
		}
	},
	{
		$: {
			id: 'three'
		}
	}]);
});

test('_mergeThemeElementByValue should return null if both arrays are null', function(t) {
	var mergedElements = lookAndFeelUtil._mergeThemeElementByValue(null, null);

	t.is(mergedElements, null);
});

test('_mergeThemeElementByValue should return non null array if one of the arrays is null', function(t) {
	var elements1 = ['one', 'two'];
	var elements2 = ['two', 'three'];

	var mergedElements = lookAndFeelUtil._mergeThemeElementByValue(elements1, null);

	t.deepEqual(mergedElements, elements1);

	mergedElements = lookAndFeelUtil._mergeThemeElementByValue(null, elements1);

	t.deepEqual(mergedElements, elements1);
});

test('_mergeThemeElementByValue should merge arrays and exclude repeated elements', function(t) {
	var elements1 = ['one', 'two'];
	var elements2 = ['two', 'three'];

	var mergedElements = lookAndFeelUtil._mergeThemeElementByValue(elements1, elements2);

	t.deepEqual(mergedElements, ['one', 'two', 'three']);
});
