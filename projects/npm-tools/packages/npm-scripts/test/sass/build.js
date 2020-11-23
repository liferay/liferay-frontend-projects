/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const buildSass = require('../../src/sass/build');
const log = require('../../src/utils/log');

jest.mock('../../src/utils/log');

const FIXTURES = path.resolve(__dirname, '../../__fixtures__/sass');
const OUTPUT_DIR = 'tmp';
const OUTPUT_SASS_DIR = '.sass-cache';
const OUTPUT_DIR_PATH = path.resolve(FIXTURES, OUTPUT_DIR);
const OUTPUT_SASS_DIR_PATH = path.resolve(
	FIXTURES,
	OUTPUT_DIR,
	OUTPUT_SASS_DIR
);

describe('sass', () => {
	beforeEach(() => {
		fs.mkdirSync(OUTPUT_DIR_PATH);
	});

	afterEach(() => {
		rimraf.sync(OUTPUT_DIR_PATH);
	});

	it('copies scss files', async () => {
		await buildSass(FIXTURES + '/main', {
			outputDir: `../${OUTPUT_DIR}`,
		});

		expect(fs.existsSync(OUTPUT_DIR_PATH + '/main.scss')).toBe(true);
	});

	it('builds css and generates sourcemap', async () => {
		await buildSass(FIXTURES + '/main', {
			outputDir: `../${OUTPUT_DIR}`,
		});

		expect(fs.existsSync(OUTPUT_SASS_DIR_PATH + '/main.css')).toBe(true);
		expect(fs.existsSync(OUTPUT_SASS_DIR_PATH + '/main.css.map')).toBe(
			true
		);

		expect(fs.readFileSync(OUTPUT_SASS_DIR_PATH + '/main.css', 'utf-8'))
			.toMatchInlineSnapshot(`
		".parent-class .child-class {
		  color: red;
		}

		/*# sourceMappingURL=main.css.map */"
	`);
	});

	it('logs message if no files found', async () => {
		expect(log).toBeCalledTimes(0);

		await buildSass(FIXTURES + '/none', {
			outputDir: `../${OUTPUT_DIR}`,
		});

		expect(log).toBeCalledTimes(1);

		expect(log).toBeCalledWith('BUILD CSS: No files found.');
	});

	it('builds css with partials', async () => {
		await buildSass(FIXTURES + '/partial', {
			outputDir: `../${OUTPUT_DIR}`,
		});

		expect(fs.existsSync(OUTPUT_SASS_DIR_PATH + '/partial.css')).toBe(true);
		expect(fs.existsSync(OUTPUT_SASS_DIR_PATH + '/partial.css.map')).toBe(
			true
		);

		expect(fs.readFileSync(OUTPUT_SASS_DIR_PATH + '/partial.css', 'utf-8'))
			.toMatchInlineSnapshot(`
		".this-is-a-partial {
		  color: blue;
		}

		/*# sourceMappingURL=partial.css.map */"
	`);
	});

	it('excludes partial files from building into their own files', async () => {
		await buildSass(FIXTURES + '/partial', {
			outputDir: `../${OUTPUT_DIR}`,
		});

		expect(fs.existsSync(OUTPUT_SASS_DIR_PATH + '/_some-partial.css')).toBe(
			false
		);
	});

	it('builds with rtl support', async () => {
		await buildSass(FIXTURES + '/rtl', {
			outputDir: `../${OUTPUT_DIR}`,
			rtl: true,
		});

		expect(fs.existsSync(OUTPUT_SASS_DIR_PATH + '/rtl.css')).toBe(true);
		expect(fs.existsSync(OUTPUT_SASS_DIR_PATH + '/rtl_rtl.css')).toBe(true);

		expect(fs.readFileSync(OUTPUT_SASS_DIR_PATH + '/rtl.css', 'utf-8'))
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
			fs.readFileSync(OUTPUT_SASS_DIR_PATH + '/rtl_rtl.css', 'utf-8')
		).toMatchInlineSnapshot(
			`".swap-for-rtl{float:right;margin-left:2px;padding:1px 4px 3px 2px;right:5px;}"`
		);
	});

	it('allows for importing variables from other files', async () => {
		await buildSass(FIXTURES + '/imports', {
			imports: [path.join(FIXTURES, 'imports', 'fake-atlas.scss')],
			outputDir: `../${OUTPUT_DIR}`,
		});

		expect(fs.existsSync(OUTPUT_SASS_DIR_PATH + '/imports.css')).toBe(true);

		expect(
			fs.readFileSync(OUTPUT_SASS_DIR_PATH + '/imports.css', 'utf-8')
		).toContain('color: red;');
	});

	it('ignores explicit excluded files', async () => {
		await buildSass(FIXTURES + '/excludes', {
			excludes: ['excluded*'],
			outputDir: `../${OUTPUT_DIR}`,
		});

		expect(fs.existsSync(OUTPUT_SASS_DIR_PATH + '/excluded.css')).toBe(
			false
		);
		expect(fs.existsSync(OUTPUT_SASS_DIR_PATH + '/included.css')).toBe(
			true
		);
	});
});
