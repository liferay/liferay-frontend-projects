'use strict';

let _ = require('lodash');
let gutil = require('gulp-util');
let sinon = require('sinon');
let test = require('ava');

let testUtil = require('../../util.js');

let GlobalModulePrompt;
let ModulePrompt;
let themeFinder;

let prototypeMethodSpy = new testUtil.PrototypeMethodSpy();

let initCwd = process.cwd();

test.cb.before(function(t) {
	testUtil.copyTempTheme(
		{
			namespace: 'global_module_prompt',
		},
		function(config) {
			GlobalModulePrompt = require('../../../lib/prompts/global_module_prompt.js');
			ModulePrompt = require('../../../lib/prompts/module_prompt.js');
			themeFinder = require('../../../lib/theme_finder');

			t.end();
		}
	);
});

test.after(function() {
	process.chdir(initCwd);

	testUtil.cleanTempTheme('base-theme', '7.0', 'global_module_prompt');
});

let prototype;

test.beforeEach(function() {
	prototype = _.create(GlobalModulePrompt.prototype);
});

test.afterEach(function() {
	prototypeMethodSpy.flush();
});

test('constructor should pass arguments to init', function(t) {
	let initSpy = prototypeMethodSpy.add(GlobalModulePrompt.prototype, 'init');

	new GlobalModulePrompt({}, _.noop);

	t.true(initSpy.calledWith({}, _.noop));
});

test('init should assign callback as done property and invoke prompting', function(
	t
) {
	prototype._getGlobalModules = sinon.spy();
	let initSpy = prototypeMethodSpy.add(ModulePrompt.prototype, 'init');

	prototype.init(
		{
			selectedModules: ['module'],
			themelet: true,
		},
		_.noop
	);

	let cb = prototype._getGlobalModules.getCall(0).args[0];

	cb('modules');

	// TODO assert that initSpy is called with correct args

	t.true(initSpy.calledOnce);
	t.deepEqual(prototype.selectedModules, ['module']);
	t.is(prototype.modules, 'modules');
	t.is(prototype.done, _.noop);
	t.is(prototype.themelet, true);
});

test('_afterPrompt should log message if no modules are found', function(t) {
	prototype.done = sinon.spy();

	let logSpy = prototypeMethodSpy.add(gutil, 'log');

	prototype._afterPrompt({});

	t.true(/No globally installed/.test(logSpy.getCall(0).args[0]));

	t.true(prototype.done.calledWith({}));
});

test('_getGlobalModules should invoke themeFinder.getLiferayThemeModules', function(
	t
) {
	let getLiferayThemeModulesSpy = prototypeMethodSpy.add(
		themeFinder,
		'getLiferayThemeModules'
	);

	prototype.themelet = 'themelet';

	prototype._getGlobalModules(_.noop);

	t.true(
		getLiferayThemeModulesSpy.calledWith(
			{
				globalModules: true,
				themelet: 'themelet',
			},
			_.noop
		)
	);
});
