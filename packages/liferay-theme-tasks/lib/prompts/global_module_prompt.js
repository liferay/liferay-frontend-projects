'use strict';

var _ = require('lodash');
var gutil = require('gulp-util');
var inquirer = require('inquirer');

var ModulePrompt = require('./module_prompt');
var promptUtil = require('./prompt_util');
var themeFinder = require('../theme_finder');

function GlobalModulePrompt() {
	this.init.apply(this, arguments);
}

GlobalModulePrompt.prototype = {
	init: function(config, cb) {
		var instance = this;

		this.done = cb;
		this.selectedModules = config.selectedModules;
		this.themelet = config.themelet;

		this._getGlobalModules(function(modules) {
			instance.modules = modules;

			new ModulePrompt(instance, _.bind(instance._afterPrompt, instance));
		});
	},

	_afterPrompt: function(answers) {
		var type = this.themelet ? 'themelet' : 'theme';

		if (_.isEmpty(this.modules)) {
			gutil.log(gutil.colors.yellow('No globally installed ' + type + ' found. Install some with "npm i -g [name]"'));
		}

		this.done(answers);
	},

	_getGlobalModules: function(cb) {
		themeFinder.getLiferayThemeModules({
			globalModules: true,
			themelet: this.themelet
		}, cb);
	}
};

module.exports = GlobalModulePrompt;
