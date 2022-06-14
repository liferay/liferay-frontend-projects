/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const chai = require('chai');
const chaiFs = require('chai-fs');

chai.use(chaiFs);

// TODO: fix functional tests and remove from ignores list
// var _ = require('lodash');
// var assert = require('yeoman-generator').assert;
// var helpers = require('yeoman-generator').test;
// var chaiAssert = chai.assert;
// var os = require('os');
// var path = require('path');
// var tempDir = path.join(os.tmpdir(), 'temp-test');
// describe('liferay-theme:layout functional tests', function() {
// 	it('should create files', function(done) {
// 		runGenerator(null, function() {
// 			assert.file([
// 				'docroot/test_layout.png',
// 				'docroot/test_layout.tpl',
// 				'docroot/WEB-INF/liferay-layout-templates.xml',
// 				'docroot/WEB-INF/liferay-plugin-package.properties',
// 			]);
//
// 			done();
// 		});
// 	});
//
// 	it('should populate WEB-INF files correctly', function(done) {
// 		runGenerator(null, function() {
// 			chaiAssert.fileContentMatch(
// 				'docroot/WEB-INF/liferay-layout-templates.xml',
// 				/<layout-template id="test-layout" name="Test Layout">/
// 			);
// 			chaiAssert.fileContentMatch(
// 				'docroot/WEB-INF/liferay-layout-templates.xml',
// 				/<template-path>\/test_layout\.tpl<\/template-path>/
// 			);
// 			chaiAssert.fileContentMatch(
// 				'docroot/WEB-INF/liferay-layout-templates.xml',
// 				/<thumbnail-path>\/test_layout\.png<\/thumbnail-path>/
// 			);
// 			chaiAssert.fileContentMatch(
// 				'docroot/WEB-INF/liferay-layout-templates.xml',
// 				/Templates 7\.0\.0\/\/EN" "http:\/\/www.liferay.com\/dtd\/liferay-layout-templates_7_0_0.dtd/
// 			);
//
// 			chaiAssert.fileContentMatch(
// 				'docroot/WEB-INF/liferay-plugin-package.properties',
// 				/liferay-versions=7\.0\.0\+/
// 			);
// 			chaiAssert.fileContentMatch(
// 				'docroot/WEB-INF/liferay-plugin-package.properties',
// 				/name=Test Layout/
// 			);
//
// 			done();
// 		});
// 	});
//
// 	it('should not create WEB-INF files and place other files in layouttpl/custom
// 			dir if created inside of theme', function(done) {
// 		runThemeGenerator(function() {
// 			runGenerator(
// 				{
// 					tmpdir: false,
// 				},
// 				function() {
// 					assert.file(['test_layout.png', 'test_layout.tpl']);
//
// 					assert.noFile([
// 						'docroot/WEB-INF/liferay-layout-templates.xml',
// 						'docroot/WEB-INF/liferay-plugin-package.properties',
// 					]);
//
// 					done();
// 				}
// 			);
// 		});
// 	});
// });
//
// function runGenerator(options, end) {
// 	options = options || {};
//
// 	options = _.defaults(options, {
// 		liferayVersion: '7.0',
// 		layoutId: 'test-layout',
// 		layoutName: 'Test Layout',
// 	});
//
// 	delete require.cache[path.join(__dirname, '../../generators/app/index.js')];
//
// 	var tmpdir = _.isUndefined(options.tmpdir) ? true : options.tmpdir;
//
// 	helpers
// 		.run(path.join(__dirname, '../../generators/layout'), {
// 			tmpdir: tmpdir,
// 		})
// 		.withOptions({
// 			'skip-creation': true,
// 		})
// 		.withPrompt(options)
// 		.on('end', end);
// }
//
// function runThemeGenerator(end) {
// 	delete require.cache[path.join(__dirname, '../../generators/app/index.js')];
//
// 	helpers
// 		.run(path.join(__dirname, '../../generators/app'))
// 		.inDir(tempDir)
// 		.withOptions({
// 			'skip-install': true,
// 		})
// 		.withPrompt({
// 			liferayVersion: '7.0',
// 			templateLanguage: 'vm',
// 			themeName: 'Test Theme',
// 		})
// 		.on('end', end);
// }
