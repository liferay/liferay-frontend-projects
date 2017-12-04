'use strict';

var _ = require('lodash');
var chai = require('chai');
var chalk = require('chalk');
var sinon = require('sinon');

var divert = require('../../lib/divert');

var chaiAssert = chai.assert;
var sinonAssert = sinon.assert;

var liferayThemeApp = require('../../generators/app/index');

describe('liferay-theme:app unit tests', function() {
	var prototype;

	beforeEach(function() {
		prototype = _.create(liferayThemeApp.prototype);
	});

	describe('_getArgs', function() {
		it('creates new args object only once', function() {
			var args = prototype._getArgs();

			chaiAssert.isObject(args);

			args.test = 'test';

			chaiAssert.deepEqual(args, prototype._getArgs());

			args.test2 = 'test';

			chaiAssert.deepEqual(args, prototype._getArgs());
		});
	});

	describe('_getWhenFn', function() {
		it('returns false false when property has been set on argv and sets property on args object', function() {
			prototype.args = {};
			prototype.argv = {};

			var flagName = 'template';
			var propertyName = 'templateLanguage';

			var whenFn = prototype._getWhenFn(propertyName, flagName);

			chaiAssert.isFunction(whenFn);
			chaiAssert(whenFn());

			prototype.argv = {
				template: 'vm'
			};

			whenFn = prototype._getWhenFn(propertyName, flagName);

			chaiAssert.isFunction(whenFn);
			chaiAssert(!whenFn());
			chaiAssert.equal(prototype.args[propertyName], 'vm');

			whenFn = prototype._getWhenFn(propertyName, flagName);
		});

		it('should correctly implement validator fn', function() {
			prototype.args = {};
			prototype.argv = {};

			var flagName = 'template';
			var propertyName = 'templateLanguage';

			var whenFn = prototype._getWhenFn(propertyName, flagName, function(value) {
				chaiAssert.fail('Invoked validator with null value', 'Should have not invoked');
			});

			chaiAssert.isFunction(whenFn);
			chaiAssert(whenFn());

			prototype.args = {};
			prototype.argv = {
				template: 'ftl'
			};

			prototype.log = function() {};

			whenFn = prototype._getWhenFn(propertyName, flagName, function(value) {
				chaiAssert(value);

				return true;
			});

			chaiAssert.isFunction(whenFn);
			chaiAssert(!whenFn());
			chaiAssert.equal(prototype.args[propertyName], 'ftl');

			prototype.args = {};

			whenFn = prototype._getWhenFn(propertyName, flagName, function(value) {
				return false;
			});

			chaiAssert.isFunction(whenFn);
			chaiAssert(whenFn());
			chaiAssert.equal(prototype.args[propertyName], undefined);
		});

		it('should not prompt if deprecated for specified liferayVersion', function() {
			prototype.args = {};
			prototype.argv = {};
			prototype.promptDeprecationMap = {
				templateLanguage: ['7.0']
			};

			var flagName = 'template';
			var propertyName = 'templateLanguage';

			var whenFn = prototype._getWhenFn(propertyName, flagName);

			chaiAssert.isFunction(whenFn);
			chaiAssert(!whenFn({
				liferayVersion: '7.0'
			}));

			prototype.argv = {
				deprecated: true
			};

			var whenFn = prototype._getWhenFn(propertyName, flagName);

			chaiAssert.isFunction(whenFn);
			chaiAssert(whenFn({
				liferayVersion: '7.0'
			}));
		});
	});

	describe('_isLiferayVersion', function() {
		it('should check for valid Liferay versions', function() {
			_.forEach(['7.1', '7.0'], function(version) {
				chaiAssert.isTrue(prototype._isLiferayVersion(version), 0, 'Valid Liferay version');
			});

			chaiAssert.isFalse(prototype._isLiferayVersion('0.1'), -1, 'Invalid Liferay version');
		});
	});

	describe('_isTemplateLanguage', function() {
		it('should check for valid template languages', function() {
			_.forEach(['ftl'], function(template) {
				chaiAssert.isTrue(prototype._isTemplateLanguage(template, {liferayVersion: '7.0'}), 0, 'Valid template language');
			});

			_.forEach(['ftl'], function(template) {
				chaiAssert.isTrue(prototype._isTemplateLanguage(template, {liferayVersion: '7.1'}), 0, 'Valid template language');
			});

			chaiAssert.isFalse(prototype._isTemplateLanguage('casper', {liferayVersion: '7.1'}), -1, 'Invalid template language');
		});
	});

	describe('_mixArgs', function() {
		it('mixes props and args', function() {
			var props = prototype._mixArgs({
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
		});
	});

	describe('_printWarnings', function() {
		it('should output a specific string if certain conditions are met', function() {
			var expectedOutput = chalk.yellow('   Warning: Velocity is deprecated for 7.0, some features will be removed in the next release.');

			prototype.log = sinon.spy();

      ['7.1', '7.0'].forEach((version) => {
        divert.defaultVersion = version;
  			prototype._printWarnings({templateLanguage: 'vm'});
      });

			sinonAssert.calledWith(prototype.log, expectedOutput);
			sinonAssert.calledOnce(prototype.log);

      prototype.log.reset();

			prototype.templateLanguage = 'ftl';

      ['7.1', '7.0'].forEach((version) => {
        divert.defaultVersion = version;
  			prototype._printWarnings({templateLanguage: 'ftl'});
      });

			sinonAssert.notCalled(prototype.log);
		});
	});

	describe('_setArgv', function() {
		it('should set correct argv properties based on shorthand values', function() {
			var originalArgv = process.argv;

			var mockArgv = ['node', 'yo', 'liferay-theme', '-n', 'My Liferay Theme', '-i', 'my-liferay-theme', '-l', '7.0'];

			process.argv = mockArgv;

			prototype._setArgv();

			chaiAssert.deepEqual(prototype.argv, {
				_: ['liferay-theme'],
				i: 'my-liferay-theme',
				id: 'my-liferay-theme',
				l: '7.0',
				liferayVersion: '7.0',
				n: 'My Liferay Theme',
				name: 'My Liferay Theme'
			});

			process.argv = originalArgv;
		});
	});
});
