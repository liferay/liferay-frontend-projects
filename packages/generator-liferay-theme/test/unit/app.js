'use strict';

var _ = require('lodash');
var chai = require('chai');
var chaiAssert = chai.assert;

var liferayThemeApp = require('../../generators/app/index');

describe('liferay-theme:app unit tests', function() {
	describe('_getArgs', function() {
		it('creates new args object only once', function(done) {
			var args = liferayThemeApp.prototype._getArgs();

			chaiAssert.isObject(args);

			args.test = 'test';

			chaiAssert.deepEqual(args, liferayThemeApp.prototype._getArgs());

			args.test2 = 'test';

			chaiAssert.deepEqual(args, liferayThemeApp.prototype._getArgs());

			done();
		});
	});

	describe('_getWhenFn', function() {
		it('returns false false when property has been set on argv and sets property on args object', function(done) {
			liferayThemeApp.prototype.args = {};
			liferayThemeApp.prototype.argv = {};

			var flagName = 'template';
			var propertyName = 'templateLanguage';

			var whenFn = liferayThemeApp.prototype._getWhenFn(propertyName, flagName);

			chaiAssert.isFunction(whenFn);
			chaiAssert(whenFn());

			liferayThemeApp.prototype.argv = {
				template: 'vm'
			};

			whenFn = liferayThemeApp.prototype._getWhenFn(propertyName, flagName);

			chaiAssert.isFunction(whenFn);
			chaiAssert(!whenFn());
			chaiAssert.equal(liferayThemeApp.prototype.args[propertyName], 'vm');

			whenFn = liferayThemeApp.prototype._getWhenFn(propertyName, flagName);

			done();
		});

		it('should correctly implement validator fn', function(done) {
			liferayThemeApp.prototype.args = {};
			liferayThemeApp.prototype.argv = {};

			var flagName = 'template';
			var propertyName = 'templateLanguage';

			var whenFn = liferayThemeApp.prototype._getWhenFn(propertyName, flagName, function(value) {
				chaiAssert.fail('Invoked validator with null value', 'Should have not invoked');
			});

			chaiAssert.isFunction(whenFn);
			chaiAssert(whenFn());

			liferayThemeApp.prototype.args = {};
			liferayThemeApp.prototype.argv = {
				template: 'ftl'
			};

			liferayThemeApp.prototype.log = function() {};

			whenFn = liferayThemeApp.prototype._getWhenFn(propertyName, flagName, function(value) {
				chaiAssert(value);

				return true;
			});

			chaiAssert.isFunction(whenFn);
			chaiAssert(!whenFn());
			chaiAssert.equal(liferayThemeApp.prototype.args[propertyName], 'ftl');

			liferayThemeApp.prototype.args = {};

			whenFn = liferayThemeApp.prototype._getWhenFn(propertyName, flagName, function(value) {
				return false;
			});

			chaiAssert.isFunction(whenFn);
			chaiAssert(whenFn());
			chaiAssert.equal(liferayThemeApp.prototype.args[propertyName], undefined);

			done();
		});

		it('should not prompt if deprecated for specified liferayVersion', function(done) {
			liferayThemeApp.prototype.args = {};
			liferayThemeApp.prototype.argv = {};
			liferayThemeApp.prototype.promptDeprecationMap = {
				templateLanguage: ['7.0']
			};

			var flagName = 'template';
			var propertyName = 'templateLanguage';

			var whenFn = liferayThemeApp.prototype._getWhenFn(propertyName, flagName);

			chaiAssert.isFunction(whenFn);
			chaiAssert(!whenFn({
				liferayVersion: '7.0'
			}));

			liferayThemeApp.prototype.argv = {
				deprecated: true
			};

			var whenFn = liferayThemeApp.prototype._getWhenFn(propertyName, flagName);

			chaiAssert.isFunction(whenFn);
			chaiAssert(whenFn({
				liferayVersion: '7.0'
			}));

			done();
		});
	});

	describe('_mixArgs', function() {
		it('mixes props and args', function(done) {
			var props = liferayThemeApp.prototype._mixArgs({
				liferayVersion: '7.0',
				templateLanguage: 'ftl'
			}, {
				templateLanguage: 'vm',
				themeId: 'id',
				themeName: 'name'
			});

			chaiAssert.deepEqual(props, {
				liferayVersion: '7.0',
				templateLanguage: 'vm',
				themeId: 'id',
				themeName: 'name'
			});

			done();
		});
	});

	describe('_setArgv', function() {
		it('should set correct argv properties based on shorthand values', function(done) {
			var originalArgv = process.argv;

			var mockArgv = ['node', 'yo', 'liferay-theme', '-n', 'My Liferay Theme', '-i', 'my-liferay-theme', '-l', '7.0'];

			process.argv = mockArgv;

			liferayThemeApp.prototype._setArgv();

			chaiAssert.deepEqual(liferayThemeApp.prototype.argv, {
				_: ['liferay-theme'],
				i: 'my-liferay-theme',
				id: 'my-liferay-theme',
				l: '7.0',
				liferayVersion: '7.0',
				n: 'My Liferay Theme',
				name: 'My Liferay Theme'
			});

			process.argv = originalArgv;

			done();
		});
	});

	describe('_isLiferayVersion', function() {
		it('should check for valid Liferay versions', function(done) {
			_.forEach(['7.0', '6.2'], function(version) {
				chaiAssert.isTrue(liferayThemeApp.prototype._isLiferayVersion(version), 0, 'Valid Liferay version');
			});

			chaiAssert.isFalse(liferayThemeApp.prototype._isLiferayVersion('0.1'), -1, 'Invalid Liferay version');

			done();
		});
	});

	describe('_isTemplateLanguage', function() {
		it('should check for valid template languages', function(done) {
			_.forEach(['ftl', 'vm'], function(template) {
				chaiAssert.isTrue(liferayThemeApp.prototype._isTemplateLanguage(template), 0, 'Valid template language');
			});

			chaiAssert.isFalse(liferayThemeApp.prototype._isTemplateLanguage('casper'), -1, 'Invalid template language');

			done();
		});
	});
});