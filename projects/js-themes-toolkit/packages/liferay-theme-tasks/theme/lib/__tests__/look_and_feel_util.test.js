/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs-extra');
const _ = require('lodash');
const sinon = require('sinon');

const {
	cleanTempTheme,
	setupTempTheme,
	stripNewlines,
} = require('../../../lib/test/util');
const lookAndFeelUtil = require('../look_and_feel_util.js');
const baseLookAndFeelJSON = require('./fixtures/look_and_feel_util/base-look-and-feel.json');
const mixedLookAndFeelJSON = require('./fixtures/look_and_feel_util/mixed-look-and-feel.json');
const parentLookAndFeelJSON = require('./fixtures/look_and_feel_util/parent-look-and-feel.json');

let tempTheme;

beforeEach(() => {
	tempTheme = setupTempTheme({
		namespace: 'look_and_feel_util',
		options: {
			pathSrc: './src',
		},
		themeName: 'base-theme',
		version: '7.1',
	});
});

afterEach(() => {
	cleanTempTheme(tempTheme);
});

it('lookAndFeelUtil should sort json correctly and build valid xml', () => {
	const xml = stripNewlines(
		lookAndFeelUtil.buildXML(
			mixedLookAndFeelJSON,
			lookAndFeelUtil.getLookAndFeelDoctypeByVersion('7.0')
		)
	);

	expect(xml).toMatchSnapshot();
});

it('correctJSONIdentifiers should set the theme element id and name attribute if the name argument is different - for themes that do not have a look-and-feel.xml', () => {
	lookAndFeelUtil.correctJSONIdentifiers(baseLookAndFeelJSON, 'Test Name');

	expect(_.get(baseLookAndFeelJSON, 'look-and-feel.theme.0.$.id')).toBe(
		'test-name'
	);
	expect(_.get(baseLookAndFeelJSON, 'look-and-feel.theme.0.$.name')).toBe(
		'Test Name'
	);

	lookAndFeelUtil.correctJSONIdentifiers(baseLookAndFeelJSON, 'Base Theme');

	expect(_.get(baseLookAndFeelJSON, 'look-and-feel.theme.0.$.id')).toBe(
		'base-theme'
	);
	expect(_.get(baseLookAndFeelJSON, 'look-and-feel.theme.0.$.name')).toBe(
		'Base Theme'
	);
});

it('getLookAndFeelDoctype should extract doctype from liferay-look-and-feel.xml', () => {
	const doctype = lookAndFeelUtil.getLookAndFeelDoctype(tempTheme.tempPath);

	expect(doctype).toBe(
		'<!DOCTYPE look-and-feel PUBLIC "-//Liferay//DTD Look and Feel 7.0.0//EN" "http://www.liferay.com/dtd/liferay-look-and-feel_7_0_0.dtd">'
	);
});

it('getLookAndFeelDoctypeByVersion should generate correct doctype string based on version', () => {
	const doctype = lookAndFeelUtil.getLookAndFeelDoctypeByVersion('1.0');

	expect(doctype).toBe(
		'<!DOCTYPE look-and-feel PUBLIC "-//Liferay//DTD Look and Feel 1.0.0//EN" "http://www.liferay.com/dtd/liferay-look-and-feel_1_0_0.dtd">'
	);
});

it('getLookAndFeelJSON should convert look-and-feel xml to json', done => {
	lookAndFeelUtil.getLookAndFeelJSON(tempTheme.tempPath, result => {
		expect(result).toBeTruthy();
		expect(result).toHaveProperty('look-and-feel');
		expect(result['look-and-feel']).toBeTruthy();

		done();
	});
});

it('mergeLookAndFeelJSON should merge look and feel json', done => {
	lookAndFeelUtil.mergeLookAndFeelJSON(tempTheme.tempPath, {}, result => {
		expect(result).toBeTruthy();
		expect(result).toHaveProperty('look-and-feel');

		expect(result).toMatchSnapshot();

		done();
	});
});

it('readLookAndFeelXML should return xml and access file only once', () => {
	// erase cache for sinon spy
	Object.keys(lookAndFeelUtil.xmlCache).forEach(
		key => delete lookAndFeelUtil.xmlCache[key]
	);

	const spy = sinon.spy(fs, 'readFileSync');

	let xml = lookAndFeelUtil.readLookAndFeelXML(tempTheme.tempPath);

	xml = lookAndFeelUtil.readLookAndFeelXML(tempTheme.tempPath);

	expect(/<look-and-feel>/.test(xml)).toBeTruthy();
	expect(spy.callCount).toBe(1);
});

it('extractThemeElement should extract elements based on tag name', done => {
	lookAndFeelUtil.getLookAndFeelJSON(tempTheme.tempPath, result => {
		const portletDecorators = lookAndFeelUtil.extractThemeElement(
			result,
			'portlet-decorator'
		);

		expect(portletDecorators.length).toBe(2);
		expect(portletDecorators[0].$.id).toBe('portlet-decorator-1');
		expect(portletDecorators[1].$.id).toBe('portlet-decorator-2');

		done();
	});
});

it('mergeJSON should merge look-and-feel json and output a valid look-and-feel json object', () => {
	let lookAndFeelJSON = lookAndFeelUtil.mergeJSON(
		baseLookAndFeelJSON,
		baseLookAndFeelJSON
	);

	expect(lookAndFeelJSON).toEqual(baseLookAndFeelJSON);

	lookAndFeelJSON = lookAndFeelUtil.mergeJSON(
		baseLookAndFeelJSON,
		parentLookAndFeelJSON
	);

	expect(lookAndFeelJSON).toMatchSnapshot();
});

it('mergeThemeElementById should return null if both arrays are null', () => {
	const mergedElements = lookAndFeelUtil.mergeThemeElementById(null, null);

	expect(mergedElements).toBeNull();
});

it('mergeThemeElementById should return non null array if one of the arrays is null', () => {
	const elements1 = [
		{
			$: {
				id: 'one',
			},
		},
	];
	const elements2 = [
		{
			$: {
				id: 'two',
			},
		},
	];

	let mergedElements = lookAndFeelUtil.mergeThemeElementById(elements1, null);

	expect(mergedElements).toBe(elements1);

	mergedElements = lookAndFeelUtil.mergeThemeElementById(null, elements2);

	expect(mergedElements).toBe(elements2);
});

it('mergeThemeElementById should merge arrays and exclude repeated elements according to id', () => {
	const elements1 = [
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
	const elements2 = [
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

	const mergedElements = lookAndFeelUtil.mergeThemeElementById(
		elements1,
		elements2
	);

	expect(mergedElements).toEqual([
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

it('mergeThemeElementByValue should return null if both arrays are null', () => {
	const mergedElements = lookAndFeelUtil.mergeThemeElementByValue(null, null);

	expect(mergedElements).toBeNull();
});

it('mergeThemeElementByValue should return non null array if one of the arrays is null', () => {
	const elements1 = ['one', 'two'];

	let mergedElements = lookAndFeelUtil.mergeThemeElementByValue(
		elements1,
		null
	);

	expect(mergedElements).toEqual(elements1);

	mergedElements = lookAndFeelUtil.mergeThemeElementByValue(null, elements1);

	expect(mergedElements).toEqual(elements1);
});

it('mergeThemeElementByValue should merge arrays and exclude repeated elements', () => {
	const elements1 = ['one', 'two'];
	const elements2 = ['two', 'three'];

	const mergedElements = lookAndFeelUtil.mergeThemeElementByValue(
		elements1,
		elements2
	);

	expect(mergedElements).toEqual(['one', 'two', 'three']);
});
