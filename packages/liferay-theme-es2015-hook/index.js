'use strict';

var ConfigGenerator = require('liferay-module-config-generator/lib/config-generator');
var fs = require('fs-extra');
var metal = require('gulp-metal');
var path = require('path');

module.exports = function(gulp, options) {
	var runSequence = require('run-sequence').use(gulp);

	var pathBuild = options.pathBuild;
	var pathSrc = options.pathSrc;

	gulp.task('configModules', function(done) {
		var metaInfPath = path.join(pathBuild, 'META-INF');

		fs.ensureDirSync(metaInfPath);

		var configGenerator = new ConfigGenerator({
			args: [path.join(pathBuild, 'js')],
			config: '',
			extension: '',
			filePattern: '**/*.es.js',
			format: ['/-/g', '_'],
			ignorePath: true,
			moduleConfig: path.join(process.cwd(), 'package.json'),
			moduleRoot: path.join(pathBuild),
			output: path.join(metaInfPath, 'config.json')
		});

		configGenerator.process().then(function() {
			done();
		});
	});

	metal.registerTasks({
		base: path.join(pathSrc, 'js'),
		buildAmdDest: path.join(pathBuild),
		buildSrc: path.join(pathSrc, 'js/**/*.es.js'),
		gulp: gulp,
		moduleName: 'js',
		taskPrefix: 'metal:'
	});

	gulp.hook('after:build:src', function(done) {
		runSequence('metal:build:amd', 'configModules', done);
	});
};
