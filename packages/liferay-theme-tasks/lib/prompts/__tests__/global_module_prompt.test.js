/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const _ = require('lodash');
const sinon = require('sinon');

const testUtil = require('../../../test/util.js');

const prototypeMethodSpy = new testUtil.PrototypeMethodSpy();

const initCwd = process.cwd();

let GlobalModulePrompt;
let ModulePrompt;
let themeFinder;

let prototype;

beforeEach(() => {
	testUtil.copyTempTheme({
		namespace: 'global_module_prompt',
	});

	GlobalModulePrompt = require('../global_module_prompt.js');
	ModulePrompt = require('../module_prompt.js');
	themeFinder = require('../../theme_finder');

	prototype = _.create(GlobalModulePrompt.prototype);
});

afterEach(() => {
	prototypeMethodSpy.flush();

	testUtil.cleanTempTheme(
		'base-theme',
		'7.1',
		'global_module_prompt',
		initCwd
	);
});

it('constructor should pass arguments to init', () => {
	const initSpy = prototypeMethodSpy.add(
		GlobalModulePrompt.prototype,
		'init'
	);

	new GlobalModulePrompt({}, _.noop);

	expect(initSpy.calledWith({}, _.noop)).toBe(true);
});

it('init should assign callback as done property and invoke prompting', () => {
	prototype._getGlobalModules = sinon.spy();

	const initSpy = prototypeMethodSpy.add(ModulePrompt.prototype, 'init');

	prototype.init(
		{
			selectedModules: ['module'],
			themelet: true,
		},
		_.noop
	);

	const cb = prototype._getGlobalModules.getCall(0).args[0];

	cb('modules');

	// TODO assert that initSpy is called with correct args

	expect(initSpy.calledOnce).toBe(true);
	expect(prototype.selectedModules).toEqual(['module']);
	expect(prototype.modules).toBe('modules');
	expect(prototype.done).toBe(_.noop);
	expect(prototype.themelet).toBe(true);
});

/*

TODO FIND A BETTER WAY TO TEST THIS

const gutil = require('gulp-util');

it('_afterPrompt should log message if no modules are found', () => {
	prototype.done = sinon.spy();

	let logSpy = prototypeMethodSpy.add(gutil, 'log');

	prototype._afterPrompt({});

	t.true(/No globally installed/.test(logSpy.getCall(0).args[0]));

	t.true(prototype.done.calledWith({}));
});
*/

it('_getGlobalModules should invoke themeFinder.getLiferayThemeModules', () => {
	const getLiferayThemeModulesSpy = prototypeMethodSpy.add(
		themeFinder,
		'getLiferayThemeModules'
	);

	prototype.themelet = 'themelet';

	prototype._getGlobalModules(_.noop);

	expect(
		getLiferayThemeModulesSpy.calledWith(
			{
				globalModules: true,
				themelet: 'themelet',
			},
			_.noop
		)
	).toBe(true);
});
