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

	beforeEach(() => {
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scripts-'));

		tempSassDir = path.join(tempDir, OUTPUT_SASS_DIR);
	});

	afterEach(() => {
		log.mockReset();
	});

	it('builds, copies, and and generates sourcemap for scss files', () => {
		buildSass(path.join(FIXTURES, 'main'), {
			outputDir: tempDir,
		});

		expect(fs.existsSync(path.join(tempDir, '/main.scss'))).toBe(true);

		expect(fs.existsSync(path.join(tempSassDir, 'main.css'))).toBe(true);
		expect(fs.existsSync(path.join(tempSassDir, 'main.css.map'))).toBe(
			true
		);

		expect(
			fs.existsSync(path.join(tempSassDir, 'nested', 'nested.css'))
		).toBe(true);
		expect(
			fs.existsSync(path.join(tempSassDir, 'nested', 'nested.css.map'))
		).toBe(true);

		expect(fs.readFileSync(path.join(tempSassDir, 'main.css'), 'utf-8'))
			.toMatchInlineSnapshot(`
		".parent-class .child-class {
		  color: red;
		}

		/*# sourceMappingURL=main.css.map */"
	`);

		expect(
			fs.readFileSync(
				path.join(tempSassDir, 'nested', 'nested.css'),
				'utf-8'
			)
		).toMatchInlineSnapshot(`
		".nested-parent-class .nested-child-class {
		  color: blue;
		}

		/*# sourceMappingURL=nested.css.map */"
	`);
	});

	it('rebuilds sass if any file has been modified', () => {
		const mainScssFilePath = path.join(tempDir, 'modified.scss');

		expect(fs.existsSync(mainScssFilePath)).toBe(false);

		buildSass(path.join(FIXTURES, 'modified'), {
			outputDir: tempDir,
		});

		expect(fs.existsSync(mainScssFilePath)).toBe(true);

		const fileCreationTime1 = fs.statSync(mainScssFilePath).ctime.getTime();

		buildSass(path.join(FIXTURES, 'modified'), {
			outputDir: tempDir,
		});

		const fileCreationTime2 = fs.statSync(mainScssFilePath).ctime.getTime();

		expect(fileCreationTime2).toBe(fileCreationTime1);

		fs.unlinkSync(mainScssFilePath);

		buildSass(path.join(FIXTURES, 'modified'), {
			outputDir: tempDir,
		});

		const fileCreationTime3 = fs.statSync(mainScssFilePath).ctime.getTime();

		expect(fileCreationTime3).toBeGreaterThan(fileCreationTime1);
		expect(fileCreationTime3).toBeGreaterThan(fileCreationTime2);
	});

	it('rebuilds sass if partial has been modified', () => {
		const mainScssFilePath = path.join(tempDir, 'partial.scss');

		expect(fs.existsSync(mainScssFilePath)).toBe(false);

		buildSass(path.join(FIXTURES, 'partial'), {
			outputDir: tempDir,
		});

		expect(fs.existsSync(mainScssFilePath)).toBe(true);

		const fileCreationTime1 = fs.statSync(mainScssFilePath).ctime.getTime();

		buildSass(path.join(FIXTURES, 'partial'), {
			outputDir: tempDir,
		});

		const fileCreationTime2 = fs.statSync(mainScssFilePath).ctime.getTime();

		expect(fileCreationTime2).toBe(fileCreationTime1);

		fs.unlinkSync(path.join(tempDir, '_some-partial.scss'));

		buildSass(path.join(FIXTURES, 'partial'), {
			outputDir: tempDir,
		});

		const fileCreationTime3 = fs.statSync(mainScssFilePath).ctime.getTime();

		expect(fileCreationTime3).toBeGreaterThan(fileCreationTime1);
		expect(fileCreationTime3).toBeGreaterThan(fileCreationTime2);
	});

	it('logs message if no files found', () => {
		expect(log).toBeCalledTimes(0);

		buildSass(path.join(FIXTURES, 'none'), {
			outputDir: tempDir,
		});

		expect(log).toBeCalledTimes(1);

		expect(log).toBeCalledWith('BUILD CSS: No files found.');
	});

	it('builds css with partials', () => {
		buildSass(path.join(FIXTURES, 'partial'), {
			outputDir: tempDir,
		});

		expect(fs.existsSync(path.join(tempDir, '_some-partial.scss'))).toBe(
			true
		);

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

	it('excludes partial files from building into their own files', () => {
		buildSass(path.join(FIXTURES, 'partial'), {
			outputDir: tempDir,
		});

		expect(fs.existsSync(path.join(tempSassDir, '_some-partial.css'))).toBe(
			false
		);
	});

	xit('builds with rtl support', () => {
		buildSass(path.join(FIXTURES, 'rtl'), {
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

	it('allows for importing variables from other files', () => {
		buildSass(path.join(FIXTURES, 'imports'), {
			imports: [path.join(FIXTURES, 'imports', 'fake-atlas.scss')],
			outputDir: tempDir,
		});

		expect(fs.existsSync(path.join(tempSassDir, 'imports.css'))).toBe(true);

		expect(
			fs.readFileSync(path.join(tempSassDir, 'imports.css'), 'utf-8')
		).toContain('color: red;');
	});

	it('ignores explicit excluded files', () => {
		buildSass(path.join(FIXTURES, 'excludes'), {
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

	it('appends timestamp to import urls', () => {
		const initialDateNow = Date.now;

		Date.now = jest.fn(() => 12345);

		buildSass(path.join(FIXTURES, 'append-timestamp'), {
			outputDir: tempDir,
		});

		expect(fs.existsSync(path.join(tempSassDir, 'main.css'))).toBe(true);

		expect(fs.readFileSync(path.join(tempSassDir, 'main.css'), 'utf-8'))
			.toMatchInlineSnapshot(`
		"@import url(\\"import.css?t=12345\\");
		@import url(\\"import2.css?t=12345\\");
		@import url(\\"import3.css?t=12345\\");

		/*# sourceMappingURL=main.css.map */"
	`);
		Date.now = initialDateNow;
	});
});
