'use strict';

var _ = require('lodash');
var chai = require('chai');
var fs = require('fs-extra');
var path = require('path');
var sinon = require('sinon');

var options = require('../../lib/options')({
	pathSrc: './custom_src_path'
});

var lookAndFeelUtil = require('../../lib/look_and_feel_util.js');

var baseLookAndFeelJSON = require('../assets/json/base-look-and-feel.json');

var assert = chai.assert;
chai.use(require('chai-fs'));

var baseThemePath = path.join(__dirname, '../assets/base-theme');

describe('Look and Feel Util functions', function() {
	describe('correctJSONIdentifiers', function() {
		lookAndFeelUtil.correctJSONIdentifiers(baseLookAndFeelJSON, 'test-id');

		assert.equal(_.get(baseLookAndFeelJSON, 'look-and-feel.theme.0.$.id'), 'test-id');
		assert.equal(_.get(baseLookAndFeelJSON, 'look-and-feel.theme.0.$.name'), 'test-id');

		lookAndFeelUtil.correctJSONIdentifiers(baseLookAndFeelJSON, 'base-theme');

		assert.equal(_.get(baseLookAndFeelJSON, 'look-and-feel.theme.0.$.id'), 'base-theme');
		assert.equal(_.get(baseLookAndFeelJSON, 'look-and-feel.theme.0.$.name'), 'base-theme');
	});

	// generateLookAndFeelXML
	it('should generate valid look-and-feel xml', function(done) {
		var xml = lookAndFeelUtil.generateLookAndFeelXML('<?xml version="1.0" standalone="true"?>\n\n<look-and-feel></look-and-feel>', '<!DOCTYPE look-and-feel>');

		assert.equal(xml, '<?xml version="1.0"?>\n<!DOCTYPE look-and-feel>\n\n\n<look-and-feel></look-and-feel>');

		done();
	});

	// getLookAndFeelDoctype
	it('should extract doctype from liferay-look-and-feel.xml', function(done) {
		var doctype = lookAndFeelUtil.getLookAndFeelDoctype(baseThemePath);

		assert.equal(doctype, '<!DOCTYPE look-and-feel PUBLIC "-//Liferay//DTD Look and Feel 7.0.0//EN" "http://www.liferay.com/dtd/liferay-look-and-feel_7_0_0.dtd">');

		done();
	});

	describe('getLookAndFeelDoctypeByVersion', function() {
		it('should generate correct doctype string based on version', function(done) {
			var doctype = lookAndFeelUtil.getLookAndFeelDoctypeByVersion('7.0');

			assert.equal(doctype, '<!DOCTYPE look-and-feel PUBLIC "-//Liferay//DTD Look and Feel 7.0.0//EN" "http://www.liferay.com/dtd/liferay-look-and-feel_7_0_0.dtd">');

			doctype = lookAndFeelUtil.getLookAndFeelDoctypeByVersion('6.2');

			assert.equal(doctype, '<!DOCTYPE look-and-feel PUBLIC "-//Liferay//DTD Look and Feel 6.2.0//EN" "http://www.liferay.com/dtd/liferay-look-and-feel_6_2_0.dtd">');

			done();
		});
	});

	// getLookAndFeelJSON
	it('should convert look-and-feel xml to json', function(done) {
		lookAndFeelUtil.getLookAndFeelJSON(baseThemePath, function(result) {
			assert(result);
			assert(result['look-and-feel']);

			done();
		});
	});

	// mergeLookAndFeelJSON
	it('should merge look and feel json', function(done) {
		lookAndFeelUtil.mergeLookAndFeelJSON(baseThemePath, {}, function(result) {
			assert(result);
			assert(result['look-and-feel']);

			assert.deepEqual(result, require('../assets/json/merged-look-and-feel.json'));
		});

		done();
	});

	// readLookAndFeelXML
	it('should return xml and access file only once', function(done) {
		// erase cache for sinon spy
		lookAndFeelUtil._xmlCache = {};

		var spy = sinon.spy(fs, 'readFileSync');

		var xml = lookAndFeelUtil.readLookAndFeelXML(baseThemePath);
		xml = lookAndFeelUtil.readLookAndFeelXML(baseThemePath);

		assert(/<look-and-feel>/.test(xml));
		assert(spy.calledOnce);

		done();
	});

	// _extractThemeElement
	it('should extract elements based on tag name', function(done) {
		lookAndFeelUtil.getLookAndFeelJSON(baseThemePath, function(result) {
			var portletDecorators = lookAndFeelUtil._extractThemeElement(result, 'portlet-decorator');

			assert(portletDecorators.length == 2);
			assert(portletDecorators[0].$.id == 'portlet-decorator-1');
			assert(portletDecorators[1].$.id == 'portlet-decorator-2');

			done();
		});
	});

	// _mergeJSON
	it('should merge look-and-feel json and output a valid look-and-feel json object', function(done) {
		var lookAndFeelJSON = lookAndFeelUtil._mergeJSON(baseLookAndFeelJSON, baseLookAndFeelJSON);

		assert.deepEqual(lookAndFeelJSON, baseLookAndFeelJSON);

		var parentLookAndFeelJSON = require('../assets/json/parent-look-and-feel.json');

		lookAndFeelJSON = lookAndFeelUtil._mergeJSON(baseLookAndFeelJSON, parentLookAndFeelJSON);

		assert.deepEqual(lookAndFeelJSON, require('../assets/json/merged-look-and-feel.json'));

		done();
	});

	describe('_mergeThemeElementById', function() {
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

		it('should return null if both arrays are null', function(done) {
			var mergedElements = lookAndFeelUtil._mergeThemeElementById(null, null);

			assert.equal(mergedElements, null);

			done();
		});

		it('should return non null array if one of the arrays is null', function(done) {
			var mergedElements = lookAndFeelUtil._mergeThemeElementById(elements1, null);

			assert.deepEqual(mergedElements, elements1);

			mergedElements = lookAndFeelUtil._mergeThemeElementById(null, elements2);

			assert.deepEqual(mergedElements, elements2);

			done();
		});

		it('should merge arrays and exclude repeated elements according to id', function(done) {
			var mergedElements = lookAndFeelUtil._mergeThemeElementById(elements1, elements2);

			assert.deepEqual(mergedElements, [{
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

			done();
		});
	});

	describe('_mergeThemeElementByValue', function() {
		var elements1 = ['one', 'two'];
		var elements2 = ['two', 'three'];

		it('should return null if both arrays are null', function(done) {
			var mergedElements = lookAndFeelUtil._mergeThemeElementByValue(null, null);

			assert.equal(mergedElements, null);

			done();
		});

		it('should return non null array if one of the arrays is null', function(done) {
			var mergedElements = lookAndFeelUtil._mergeThemeElementByValue(elements1, null);

			assert.deepEqual(mergedElements, elements1);

			mergedElements = lookAndFeelUtil._mergeThemeElementByValue(null, elements1);

			assert.deepEqual(mergedElements, elements1);

			done();
		});

		it('should merge arrays and exclude repeated elements', function(done) {
			var mergedElements = lookAndFeelUtil._mergeThemeElementByValue(elements1, elements2);

			assert.deepEqual(mergedElements, ['one', 'two', 'three']);

			done();
		});
	});
});
