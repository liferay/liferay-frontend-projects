'use strict';

let _ = require('lodash');
let fs = require('fs-extra');
let path = require('path');
let sinon = require('sinon');
let test = require('ava');

let testUtil = require('../util');

let baseLookAndFeelJSON = require('../fixtures/json/base-look-and-feel.json');
let mixedLookAndFeelJSON = require('../fixtures/json/mixed-look-and-feel.json');

let baseThemePath = path.join(__dirname, '../fixtures/themes/7.0/base-theme');
let initCwd = process.cwd();
let lookAndFeelUtil;

test.after(function() {
	process.chdir(initCwd);
});

test.before(function() {
	process.chdir(baseThemePath);

	require('../../lib/options')({
		pathSrc: './custom_src_path',
	});

	lookAndFeelUtil = require('../../lib/look_and_feel_util.js');
});

test('lookAndFeelUtil should sort json correctly and build valid xml', function(
	t
) {
	let xml = testUtil.stripNewlines(
		lookAndFeelUtil.buildXML(
			mixedLookAndFeelJSON,
			lookAndFeelUtil.getLookAndFeelDoctypeByVersion('7.0')
		)
	);

	let xmlFileContent = testUtil.stripNewlines(
		fs.readFileSync(
			path.join(__dirname, '../fixtures/xml/liferay-look-and-feel.xml'),
			{
				encoding: 'utf8',
			}
		)
	);

	t.is(xml, xmlFileContent);
});

test('correctJSONIdentifiers should set the theme element id and name attribute if the name argument is different - for themes that do not have a look-and-feel.xml', function(
	t
) {
	lookAndFeelUtil.correctJSONIdentifiers(baseLookAndFeelJSON, 'Test Name');

	t.is(_.get(baseLookAndFeelJSON, 'look-and-feel.theme.0.$.id'), 'test-name');
	t.is(
		_.get(baseLookAndFeelJSON, 'look-and-feel.theme.0.$.name'),
		'Test Name'
	);

	lookAndFeelUtil.correctJSONIdentifiers(baseLookAndFeelJSON, 'Base Theme');

	t.is(
		_.get(baseLookAndFeelJSON, 'look-and-feel.theme.0.$.id'),
		'base-theme'
	);
	t.is(
		_.get(baseLookAndFeelJSON, 'look-and-feel.theme.0.$.name'),
		'Base Theme'
	);
});

test('getLookAndFeelDoctype should extract doctype from liferay-look-and-feel.xml', function(
	t
) {
	let doctype = lookAndFeelUtil.getLookAndFeelDoctype(baseThemePath);

	t.is(
		doctype,
		'<!DOCTYPE look-and-feel PUBLIC "-//Liferay//DTD Look and Feel 7.0.0//EN" "http://www.liferay.com/dtd/liferay-look-and-feel_7_0_0.dtd">'
	);
});

test('getLookAndFeelDoctypeByVersion should generate correct doctype string based on version', function(
	t
) {
	let doctype = lookAndFeelUtil.getLookAndFeelDoctypeByVersion('1.0');

	t.is(
		doctype,
		'<!DOCTYPE look-and-feel PUBLIC "-//Liferay//DTD Look and Feel 1.0.0//EN" "http://www.liferay.com/dtd/liferay-look-and-feel_1_0_0.dtd">'
	);
});

test.cb('getLookAndFeelJSON should convert look-and-feel xml to json', function(
	t
) {
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

		t.deepEqual(
			result,
			require('../fixtures/json/merged-look-and-feel.json')
		);

		t.end();
	});
});

test('readLookAndFeelXML should return xml and access file only once', function(
	t
) {
	// erase cache for sinon spy

	lookAndFeelUtil._xmlCache = {};

	let spy = sinon.spy(fs, 'readFileSync');

	let xml = lookAndFeelUtil.readLookAndFeelXML(baseThemePath);

	xml = lookAndFeelUtil.readLookAndFeelXML(baseThemePath);

	t.truthy(/<look-and-feel>/.test(xml));
	t.truthy(spy.calledOnce);
});

test.cb(
	'_extractThemeElement should extract elements based on tag name',
	function(t) {
		lookAndFeelUtil.getLookAndFeelJSON(baseThemePath, function(result) {
			let portletDecorators = lookAndFeelUtil._extractThemeElement(
				result,
				'portlet-decorator'
			);

			t.is(portletDecorators.length, 2);
			t.is(portletDecorators[0].$.id, 'portlet-decorator-1');
			t.is(portletDecorators[1].$.id, 'portlet-decorator-2');

			t.end();
		});
	}
);

test('_mergeJSON should merge look-and-feel json and output a valid look-and-feel json object', function(
	t
) {
	let lookAndFeelJSON = lookAndFeelUtil._mergeJSON(
		baseLookAndFeelJSON,
		baseLookAndFeelJSON
	);

	t.deepEqual(lookAndFeelJSON, baseLookAndFeelJSON);

	let parentLookAndFeelJSON = require('../fixtures/json/parent-look-and-feel.json');

	lookAndFeelJSON = lookAndFeelUtil._mergeJSON(
		baseLookAndFeelJSON,
		parentLookAndFeelJSON
	);

	t.deepEqual(
		lookAndFeelJSON,
		require('../fixtures/json/merged-look-and-feel.json')
	);
});

let elements1 = [
	{
		$: {
			id: 'one',
		},
	},
	{
		$: {
			id: 'two',
		},
	},
];
let elements2 = [
	{
		$: {
			id: 'two',
		},
	},
	{
		$: {
			id: 'three',
		},
	},
];

test('_mergeThemeElementById should return null if both arrays are null', function(
	t
) {
	let mergedElements = lookAndFeelUtil._mergeThemeElementById(null, null);

	t.is(mergedElements, null);
});

test('_mergeThemeElementById should return non null array if one of the arrays is null', function(
	t
) {
	let mergedElements = lookAndFeelUtil._mergeThemeElementById(
		elements1,
		null
	);

	t.is(mergedElements, elements1);

	mergedElements = lookAndFeelUtil._mergeThemeElementById(null, elements2);

	t.is(mergedElements, elements2);
});

test('_mergeThemeElementById should merge arrays and exclude repeated elements according to id', function(
	t
) {
	let mergedElements = lookAndFeelUtil._mergeThemeElementById(
		elements1,
		elements2
	);

	t.deepEqual(mergedElements, [
		{
			$: {
				id: 'one',
			},
		},
		{
			$: {
				id: 'two',
			},
		},
		{
			$: {
				id: 'three',
			},
		},
	]);
});

test('_mergeThemeElementByValue should return null if both arrays are null', function(
	t
) {
	let mergedElements = lookAndFeelUtil._mergeThemeElementByValue(null, null);

	t.is(mergedElements, null);
});

test('_mergeThemeElementByValue should return non null array if one of the arrays is null', function(
	t
) {
	let elements1 = ['one', 'two'];
	let elements2 = ['two', 'three'];

	let mergedElements = lookAndFeelUtil._mergeThemeElementByValue(
		elements1,
		null
	);

	t.deepEqual(mergedElements, elements1);

	mergedElements = lookAndFeelUtil._mergeThemeElementByValue(null, elements1);

	t.deepEqual(mergedElements, elements1);
});

test('_mergeThemeElementByValue should merge arrays and exclude repeated elements', function(
	t
) {
	let elements1 = ['one', 'two'];
	let elements2 = ['two', 'three'];

	let mergedElements = lookAndFeelUtil._mergeThemeElementByValue(
		elements1,
		elements2
	);

	t.deepEqual(mergedElements, ['one', 'two', 'three']);
});
