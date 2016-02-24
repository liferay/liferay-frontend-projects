'use strict';

var chai = require('chai');
var chaiAssert = chai.assert;

var liferayThemeApp = require('../../generators/app/index');

describe('liferay-theme:app unit tests', function() {
	// _getArgs
	it('creates new args object only once', function(done) {
		var args = liferayThemeApp.prototype._getArgs();

		chaiAssert.isObject(args);

		args.test = 'test';

		chaiAssert.deepEqual(args, liferayThemeApp.prototype._getArgs());

		args.test2 = 'test';

		chaiAssert.deepEqual(args, liferayThemeApp.prototype._getArgs());

		done();
	});

	// _getWhenFn
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

	// _getWhenFn
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

	// _mixArgs
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

	// _setArgv
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