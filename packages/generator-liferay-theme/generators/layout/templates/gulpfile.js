'use strict';

var gulp = require('gulp');
var liferayPluginTasks = require('liferay-plugin-node-tasks');

liferayPluginTasks.registerTasks({
	gulp: gulp
});

gulp.task('build', ['plugin:war']);
gulp.task('deploy', ['plugin:deploy']);
gulp.task('init', ['plugin:init']);
