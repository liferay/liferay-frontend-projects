/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const minify = require('../../src/utils/minify');

describe('minify()', () => {
	let cwd;
	let temp;

	beforeEach(() => {
		cwd = process.cwd();

		temp = fs.mkdtempSync(path.join(os.tmpdir(), 'format-'));

		process.chdir(temp);

		fs.mkdirSync('build');
		fs.mkdirSync('build/node');
		fs.mkdirSync('build/node/packageRunBuild');
		fs.mkdirSync('build/node/packageRunBuild/resources');

		fs.writeFileSync(
			'build/node/packageRunBuild/resources/script.js',
			`
			alert( 'minify this' );
		`
		);

		fs.writeFileSync(
			'build/node/packageRunBuild/resources/page.jsp',
			`
			<h1>Hi</h1>

			<script>
				alert( 'minify this too' );
			</script>
		`
		);
	});

	afterEach(() => {
		process.chdir(cwd);
	});

	it('minifies JS in a JS file in the "build/" directory', async () => {
		await minify();

		expect(
			fs.readFileSync(
				'build/node/packageRunBuild/resources/script.js',
				'utf8'
			)
		).toBe(
			'alert("minify this");\n' + '//# sourceMappingURL=script.js.map'
		);
	});

	it('creates a source map for a JS file in the "build/" directory', async () => {
		await minify();

		expect(
			JSON.parse(
				fs.readFileSync(
					'build/node/packageRunBuild/resources/script.js.map',
					'utf8'
				)
			)
		).toEqual(
			expect.objectContaining({
				mappings: expect.anything(),
				names: expect.anything(),
				sources: expect.anything(),
				version: expect.anything(),
			})
		);
	});

	it('minifies JS in a JSP file in the "build/" directory', async () => {
		await minify();

		expect(
			fs.readFileSync(
				'build/node/packageRunBuild/resources/page.jsp',
				'utf8'
			)
		).toBe(`
			<h1>Hi</h1>

			<script>alert("minify this too");</script>
		`);
	});

	// Regression test.
	// See: https://github.com/liferay/liferay-frontend-projects/pull/251

	it('does not re-order JSP syntax during minification', async () => {

		// Reduced example from site-navigation-menu-web's configuration.jsp.

		fs.writeFileSync(
			'build/node/packageRunBuild/resources/configuration.jsp',
			`
				<aui:script>
					var form = document.<portlet:namespace />fm;

					form.addEventListener('change', <portlet:namespace />resetPreview);

					function <portlet:namespace />resetPreview() {
						// Terser was hosting this function to the top,
						// causing the JSP expressions and namespace
						// tags to get restored back into the wrong
						// slots.

						var data = Liferay.Util.ns('_<%= HtmlUtil.escapeJS(portletResource) %>_', data);
					}
				</aui:script>
		`
		);

		await minify();

		expect(
			fs.readFileSync(
				'build/node/packageRunBuild/resources/configuration.jsp',
				'utf8'
			)
		).toBe(`
				<aui:script>var form=document.<portlet:namespace />fm;form.addEventListener("change",<portlet:namespace />resetPreview);function <portlet:namespace />resetPreview(){var data=Liferay.Util.ns("_<%= HtmlUtil.escapeJS(portletResource) %>_",data)}</aui:script>
		`);
	});
});
