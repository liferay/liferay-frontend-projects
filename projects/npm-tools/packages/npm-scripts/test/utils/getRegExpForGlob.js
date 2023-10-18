/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const getRegExpForGlob = require('../../src/utils/getRegExpForGlob');

expect.extend({
	toMatchGlob(file, glob) {
		const pass = getRegExpForGlob(glob).test(file);

		return {
			message() {
				const predicate = pass ? 'not to match' : 'to match';

				return `expected path ${file} ${predicate} glob ${glob}`;
			},
			pass,
		};
	},
});

describe('getRegExpForGlob()', () => {
	describe('"foo"', () => {
		it('matches at any level of the hierarchy', () => {
			expect('foo').toMatchGlob('foo');
			expect('a/b/foo').toMatchGlob('foo');

			expect('bar').not.toMatchGlob('foo');
			expect('a/b/bar').not.toMatchGlob('foo');
		});

		it('does not match when file path is absolute', () => {
			expect('/foo').not.toMatchGlob('foo');
			expect('/a/b/foo').not.toMatchGlob('foo');
		});
	});

	describe('"*"', () => {
		it('matches zero or more of any character except slash', () => {
			expect('a/b/foo').toMatchGlob('*');
			expect('a/b/foo').toMatchGlob('foo*');
			expect('a/b/foo.js').toMatchGlob('*');
			expect('a/b/foo.js').toMatchGlob('*.js');

			expect('a/b/foo.jsp').not.toMatchGlob('*.js');
			expect('a/b/foo/bar').not.toMatchGlob('foo*');
		});
	});

	describe('"/foo"', () => {

		// From `man 5 gitignore`:
		//
		//     A leading slash matches the beginning of the
		//     pathname. For example, "/*.c" matches "cat-file.c" but not
		//     "mozilla-sha1/sha1.c".

		it('matches at the beginning of the pathname', () => {
			expect('foo').toMatchGlob('/foo');
			expect('bar/foo').not.toMatchGlob('/foo');

			expect('cat-file.c').toMatchGlob('/*.c');
			expect('mozilla-sha1/sha1.c').not.toMatchGlob('/*.c');
		});
	});

	describe('"**/"', () => {

		// From `man 5 gitignore`:
		//
		//     A leading "**" followed by a slash means match in all
		//     directories. For example, "**/foo" matches file or directory
		//     "foo" anywhere, the same as pattern "foo". "**/foo/bar" matches
		//     file or directory "bar" anywhere that is directly under
		//     directory "foo".

		it('matches leading directories', () => {
			expect('a/b/foo').toMatchGlob('**/foo');
			expect('a/b/bar').not.toMatchGlob('**/foo');

			expect('a/b/foo/bar').toMatchGlob('**/foo/bar');
			expect('a/b/foo').not.toMatchGlob('**/foo/bar');
			expect('a/b/bar').not.toMatchGlob('**/foo/bar');
		});

		it('matches at the top level', () => {
			expect('foo').toMatchGlob('**/foo');
			expect('bar').not.toMatchGlob('**/foo');
		});
	});

	describe('"/**"', () => {

		// From `man 5 gitignore`:
		//
		//     A trailing "/**" matches everything inside. For example,
		//     "abc/**" matches all files inside directory "abc", relative to
		//     the location of the .gitignore file, with infinite depth.

		it('matches at the top level', () => {
			expect('foo').toMatchGlob('/**');
			expect('foo/a').not.toMatchGlob('/**');
			expect('foo/a/b').not.toMatchGlob('/**');

			expect('foo/a').toMatchGlob('foo/**');
			expect('foo/a/b').toMatchGlob('foo/**');
		});

		it('matches below the top level', () => {
			expect('a/b/foo/a').toMatchGlob('foo/**');
			expect('a/b/foo/a/b').toMatchGlob('foo/**');

			expect('a/b/bar').not.toMatchGlob('foo/**');
			expect('a/b/foo').not.toMatchGlob('foo/**');
		});
	});

	describe('"/**/"', () => {

		// From `man 5 gitignore`:
		//
		//     A slash followed by two consecutive asterisks then a slash
		//     matches zero or more directories. For example, "a/**/b" matches
		//     "a/b", "a/x/b", "a/x/y/b" and so on.

		it('matches zero or more directories at the top level', () => {
			expect('a/b').toMatchGlob('a/**/b');
			expect('a/x/b').toMatchGlob('a/**/b');
			expect('a/x/y/b').toMatchGlob('a/**/b');
		});

		it('matches zero or more directories below the top level', () => {
			expect('foo/bar/a/b').toMatchGlob('a/**/b');
			expect('foo/bar/a/x/b').toMatchGlob('a/**/b');
			expect('foo/bar/a/x/y/b').toMatchGlob('a/**/b');
		});
	});

	describe('"**"', () => {

		// From `man 5 gitignore`:
		//
		//     Other consecutive asterisks are considered regular asterisks
		//     and will match according to the previous rules.

		it('behaves like an asterisk', () => {
			expect('a/b/foo').toMatchGlob('**');
			expect('a/b/foo').toMatchGlob('foo**');
			expect('a/b/foo.js').toMatchGlob('**');
			expect('a/b/foo.js').toMatchGlob('**.js');

			expect('a/b/foo.jsp').not.toMatchGlob('**.js');
			expect('a/b/foo/bar').not.toMatchGlob('foo**');
		});
	});

	describe('"!"', () => {
		it('marks the pattern as negated', () => {
			expect(getRegExpForGlob('!foo').negated).toBe(true);
			expect(getRegExpForGlob('foo').negated).not.toBe(false);
		});

		it('can still be used to match', () => {
			expect('foo').toMatchGlob('!foo');
			expect('bar').not.toMatchGlob('!foo');
		});
	});

	// prettier-ignore

	it('handles real glob patterns from liferay-portal', () => {

		// These taken from liferay-portal as of ced3d6d93c8721ae09ea2c2c88.

		expect('apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/liferay.js')
			.toMatchGlob('**/*.js');
		expect('apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/liferay.js')
			.not.toMatchGlob('!**/*.es.js');

		expect('apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/DefaultEventHandler.es.js')
			.toMatchGlob('**/*.js');
		expect('apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/DefaultEventHandler.es.js')
			.toMatchGlob('!**/*.es.js');

		expect('apps/layout/layout-content-page-editor-web/.eslintrc.js').
			toMatchGlob('!**/*/.eslintrc.js');
		expect('apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/DefaultEventHandler.es.js')
			.not.toMatchGlob('!**/*/.eslintrc.js');

		expect('apps/asset/asset-list-web/npmscripts.config.js')
			.toMatchGlob('!**/*/npmscripts.config.js');
		expect('apps/layout/layout-content-page-editor-web/.eslintrc.js')
			.not.toMatchGlob('!**/*/npmscripts.config.js');

		expect('.prettierrc.js')
			.toMatchGlob('!.prettierrc.js');
		expect('apps/layout/layout-content-page-editor-web/.eslintrc.js')
			.not.toMatchGlob('!.prettierrc.js');

		expect('apps/frontend-editor/frontend-editor-ckeditor-web/build/unzipped-jar/META-INF/resources/_diffs/plugins/media/dialogs/video.js')
			.toMatchGlob('**/build/**/*');

		expect('apps/deprecated/social-activity-web/classes/META-INF/resources/js/main.js')
			.toMatchGlob('**/classes/**/*');

		expect('apps/frontend-theme-porygon/frontend-theme-porygon/build/css/clay/atlas/_variables.scss')
			.toMatchGlob('**/css/clay/**/*');

		expect('apps/asset/asset-list-web/build/npm/npmRunBuild/outputs/META-INF/resources/node_modules/asset-list-web$uuid@3.3.2/v4.js')
			.toMatchGlob('**/node_modules/**/*');
		expect('node_modules/jsdom/lib/jsdom/vm-shim.js')
			.toMatchGlob( '**/node_modules/**/*');

		expect('apps/site/site-buildings-site-initializer/src/main/zippableResources/fragments/buildings/spacer/index.js')
			.toMatchGlob('**/zippableResources/**/*');

		expect('sdk/gradle-plugins-node/src/gradleTest/npmRunTest/scripts/test.js')
			.toMatchGlob('**/sdk/**/*');

		expect('copyright.js')
			.toMatchGlob('/copyright.js');
		expect('npmscripts.config.js')
			.not.toMatchGlob('/copyright.js');

		expect('apps/fragment/fragment-demo-data-creator-impl/src/main/resources/com/liferay/fragment/demo/data/creator/internal/dependencies/fragment1/demo.js')
			.toMatchGlob('apps/fragment/fragment-demo-data-creator-impl/src/main/resources/com/liferay/fragment/demo/data/creator/internal/dependencies/**/*.js');

		expect('apps/fragment/fragment-test/src/testIntegration/resources/com/liferay/fragment/dependencies/fragments/fragments/card/index.js').
			toMatchGlob('apps/fragment/fragment-test/src/testIntegration/resources/com/liferay/fragment/dependencies/**/*.js');

		expect('yarn-1.13.0.js')
			.toMatchGlob('/yarn-*.js');
	});
});
