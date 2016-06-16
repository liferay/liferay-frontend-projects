'use strict';

var del = require('del');
var path = require('path');
var test = require('ava');

var gulpBlackList = require('../../../lib/upgrade/6.2/gulp_black_list.js');
var testUtil = require('../../util');

var gulp;
var runSequence;
var tempPath;

var initCwd = process.cwd();

test.cb.before(function(t) {
	testUtil.copyTempTheme({
		namespace: 'upgrade_task_black_list',
		themeName: 'upgrade-theme',
		version: '6.2',
		registerTasksOptions: {
			pathSrc: 'src',
			rubySass: true
		}
	}, function(config) {
		tempPath = config.tempPath;
		runSequence = config.runSequence;
		gulp = config.gulp;

		t.end();
	});
});

test.after(function() {
	process.chdir(initCwd);

	testUtil.cleanTempTheme('upgrade-theme', '6.2', 'upgrade_task_black_list');
});

test.cb('should create blacklist of scss mixins found in theme css files', function(t) {
	runSequence('upgrade:black-list', function(err) {
		if (err) throw err;

		gulp.src(path.join(tempPath, 'src/css/*'))
			.pipe(gulpBlackList(null, function(result) {
				t.truthy(result.mixins);
				t.true(result.mixins.indexOf('border-radius') > -1);

				t.end();
			}));
	});
});
