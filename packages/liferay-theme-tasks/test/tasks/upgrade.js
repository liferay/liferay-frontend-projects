'use strict';

var chai = require('chai');
var fs = require('fs-extra');
var gulp = require('gulp');
var os = require('os');
var path = require('path');
var registerTasks = require('../../index.js').registerTasks;

var assert = chai.assert;
chai.use(require('chai-fs'));

var tempPath = path.join(os.tmpdir(), 'liferay-theme-tasks', 'upgrade-theme-62');

describe('6.2 -> 7.0 Upgrade Tasks', function() {
	before(function(done) {
		this.timeout(10000);

		var instance = this;

		instance._initCwd = process.cwd();

		fs.copy(path.join(__dirname, '../assets/upgrade-theme-62'), tempPath, function(err) {
			if (err) throw err;

			process.chdir(tempPath);

			instance._buildPath = path.join(tempPath, 'custom_build_path');
			instance._tempPath = tempPath;

			var config = {
				gulp: gulp,
				supportCompass: true
			};

			require('../../lib/upgrade/6.2/upgrade')(config);

			registerTasks(config);

			console.log('Creating temp theme in', tempPath);

			done();
		});
	});

	after(function() {
		fs.removeSync(tempPath);

		process.chdir(this._initCwd);
	});

	it('should create backup files from source', function(done) {
		var instance = this;

		gulp.start('upgrade:create-backup-files', function(err) {
			if (err) throw err;

			assert.isDirectory(path.join(tempPath, '_backup'), '_backup is a directory');
			assert.isDirectory(path.join(tempPath, '_backup/src'), '_backup/src is a directory');
			assert.isFile(path.join(tempPath, '_backup/src/css/custom.css'), '_backup/src/css/custom.css is a file');

			done();
		});
	});

	// it('should create blacklist of scss variabels found in theme css files', function(done) {
	// 	gulp.start('upgrade:black-list', function(err) {
	// 		if (err) throw err;

	// 		done();
	// 	});
	// });

	// it('upgrade:replace-compass', function(done) {
	// 	gulp.start('upgrade:replace-compass', function(err) {
	// 		if (err) throw err;

	// 		done();
	// 	});
	// });

	// it('upgrade:convert-bootstrap', function(done) {
	// 	gulp.start('upgrade:convert-bootstrap', function(err) {
	// 		if (err) throw err;

	// 		done();
	// 	});
	// });

	// it('upgrade:config', function(done) {
	// 	gulp.start('upgrade:config', function(err) {
	// 		if (err) throw err;

	// 		done();
	// 	});
	// });

	// it('upgrade:rename-core-files', function(done) {
	// 	gulp.start('upgrade:rename-core-files', function(err) {
	// 		if (err) throw err;

	// 		done();
	// 	});
	// });

	// it('upgrade:create-css-diff', function(done) {
	// 	gulp.start('upgrade:create-css-diff', function(err) {
	// 		if (err) throw err;

	// 		done();
	// 	});
	// });

	// it('upgrade:dependencies', function(done) {
	// 	gulp.start('upgrade:dependencies', function(err) {
	// 		if (err) throw err;

	// 		done();
	// 	});
	// });

	// it('upgrade:create-deprecated-mixins', function(done) {
	// 	gulp.start('upgrade:create-deprecated-mixins', function(err) {
	// 		if (err) throw err;

	// 		done();
	// 	});
	// });

	// it('upgrade:templates', function(done) {
	// 	gulp.start('upgrade:templates', function(err) {
	// 		if (err) throw err;

	// 		done();
	// 	});
	// });

	// it('upgrade:log-changes', function(done) {
	// 	gulp.start('upgrade:log-changes', function(err) {
	// 		if (err) throw err;

	// 		done();
	// 	});
	// });
});
