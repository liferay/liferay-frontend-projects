/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const buildSass = require('../../src/sass/build');
const log = require('../../src/utils/log');

jest.mock('../../src/utils/log');

const FIXTURES = path.resolve(__dirname, '../../__fixtures__/sass');
const OUTPUT_SASS_DIR = '.sass-cache';

describe('sass', () => {
	let tempDir;
	let tempSassDir;

	beforeAll(() => {
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scripts-'));

		tempSassDir = path.join(tempDir, OUTPUT_SASS_DIR);
	});

	it('copies scss files', async () => {
		await buildSass(path.join(FIXTURES, 'main'), {
			outputDir: tempDir,
		});

		expect(fs.existsSync(path.join(tempDir, '/main.scss'))).toBe(true);
	});

	it('builds css and generates sourcemap', async () => {
		await buildSass(path.join(FIXTURES, 'main'), {
			outputDir: tempDir,
		});

		expect(fs.existsSync(path.join(tempSassDir, 'main.css'))).toBe(true);
		expect(fs.existsSync(path.join(tempSassDir, 'main.css.map'))).toBe(
			true
		);

		expect(fs.readFileSync(path.join(tempSassDir, 'main.css'), 'utf-8'))
			.toMatchInlineSnapshot(`
		".parent-class .child-class {
		  color: red;
		}

		/*# sourceMappingURL=main.css.map */"
	`);
	});

	it('logs message if no files found', async () => {
		expect(log).toBeCalledTimes(0);

		await buildSass(path.join(FIXTURES, 'none'), {
			outputDir: tempDir,
		});

		expect(log).toBeCalledTimes(1);

		expect(log).toBeCalledWith('BUILD CSS: No files found.');
	});

	it('builds css with partials', async () => {
		await buildSass(path.join(FIXTURES, 'partial'), {
			outputDir: tempDir,
		});

		expect(fs.existsSync(path.join(tempSassDir, 'partial.css'))).toBe(true);
		expect(fs.existsSync(path.join(tempSassDir, 'partial.css.map'))).toBe(
			true
		);

		expect(fs.readFileSync(path.join(tempSassDir, 'partial.css'), 'utf-8'))
			.toMatchInlineSnapshot(`
		".this-is-a-partial {
		  color: blue;
		}

		/*# sourceMappingURL=partial.css.map */"
	`);
	});

	it('excludes partial files from building into their own files', async () => {
		await buildSass(path.join(FIXTURES, 'partial'), {
			outputDir: tempDir,
		});

		expect(fs.existsSync(path.join(tempSassDir, '_some-partial.css'))).toBe(
			false
		);
	});

	it('builds with rtl support', async () => {
		await buildSass(path.join(FIXTURES, 'rtl'), {
			outputDir: tempDir,
			rtl: true,
		});

		expect(fs.existsSync(path.join(tempSassDir, 'rtl.css'))).toBe(true);
		expect(fs.existsSync(path.join(tempSassDir, 'rtl_rtl.css'))).toBe(true);

		expect(fs.readFileSync(path.join(tempSassDir, 'rtl.css'), 'utf-8'))
			.toMatchInlineSnapshot(`
		".swap-for-rtl {
		  float: left;
		  margin-right: 2px;
		  padding: 1px 2px 3px 4px;
		  left: 5px;
		}

		/*# sourceMappingURL=rtl.css.map */"
	`);

		expect(
			fs.readFileSync(path.join(tempSassDir, 'rtl_rtl.css'), 'utf-8')
		).toMatchInlineSnapshot(
			`".swap-for-rtl{float:right;margin-left:2px;padding:1px 4px 3px 2px;right:5px;}"`
		);
	});

	it('allows for importing variables from other files', async () => {
		await buildSass(path.join(FIXTURES, 'imports'), {
			imports: [path.join(FIXTURES, 'imports', 'fake-atlas.scss')],
			outputDir: tempDir,
		});

		expect(fs.existsSync(path.join(tempSassDir, 'imports.css'))).toBe(true);

		expect(
			fs.readFileSync(path.join(tempSassDir, 'imports.css'), 'utf-8')
		).toContain('color: red;');
	});

	it('ignores explicit excluded files', async () => {
		await buildSass(path.join(FIXTURES, 'excludes'), {
			excludes: ['excluded*'],
			outputDir: tempDir,
		});

		expect(fs.existsSync(path.join(tempSassDir, 'excluded.css'))).toBe(
			false
		);
		expect(fs.existsSync(path.join(tempSassDir, 'included.css'))).toBe(
			true
		);
	});
});
