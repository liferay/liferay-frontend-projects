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

	it('copies css files', () => {
		buildSass(path.join(FIXTURES, 'css'), {
			outputDir: tempDir,
		});

		expect(fs.existsSync(path.join(tempDir, '/main.css'))).toBe(true);
		expect(fs.existsSync(path.join(tempDir, '/nested/nested.css'))).toBe(
			true
		);
	});

	it('copies css files with rtl files', () => {
		buildSass(path.join(FIXTURES, 'css'), {
			outputDir: tempDir,
			rtl: true,
		});

		expect(fs.existsSync(path.join(tempDir, '/main.css'))).toBe(true);
		expect(fs.existsSync(path.join(tempDir, '/nested/nested.css'))).toBe(
			true
		);

		expect(fs.existsSync(path.join(tempDir, '/main_rtl.css'))).toBe(true);
		expect(
			fs.existsSync(path.join(tempDir, '/nested/nested_rtl.css'))
		).toBe(true);
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

	// it('rebuilds sass if any file has been modified', async () => {
	// 	const mainScssFilePath = path.join(tempDir, 'modified.scss');

	// 	expect(fs.existsSync(mainScssFilePath)).toBe(false);

	// 	buildSass(path.join(FIXTURES, 'modified'), {
	// 		outputDir: tempDir,
	// 	});

	// 	expect(fs.existsSync(mainScssFilePath)).toBe(true);

	// 	const fileCreationTime1 = fs.statSync(mainScssFilePath).ctimeMs;

	// 	await pause(100);

	// 	buildSass(path.join(FIXTURES, 'modified'), {
	// 		outputDir: tempDir,
	// 	});

	// 	const fileCreationTime2 = fs.statSync(mainScssFilePath).ctimeMs;

	// 	expect(fileCreationTime2).toBe(fileCreationTime1);

	// 	fs.unlinkSync(mainScssFilePath);

	// 	await pause(100);

	// 	buildSass(path.join(FIXTURES, 'modified'), {
	// 		outputDir: tempDir,
	// 	});

	// 	const fileCreationTime3 = fs.statSync(mainScssFilePath).ctimeMs;

	// 	expect(fileCreationTime3).toBeGreaterThan(fileCreationTime1);
	// 	expect(fileCreationTime3).toBeGreaterThan(fileCreationTime2);
	// });

	// it('rebuilds sass if partial has been modified', async () => {
	// 	const mainScssFilePath = path.join(tempDir, 'partial.scss');

	// 	expect(fs.existsSync(mainScssFilePath)).toBe(false);

	// 	buildSass(path.join(FIXTURES, 'partial'), {
	// 		outputDir: tempDir,
	// 	});

	// 	expect(fs.existsSync(mainScssFilePath)).toBe(true);

	// 	const fileCreationTime1 = fs.statSync(mainScssFilePath).ctimeMs;

	// 	await pause(100);

	// 	buildSass(path.join(FIXTURES, 'partial'), {
	// 		outputDir: tempDir,
	// 	});

	// 	const fileCreationTime2 = fs.statSync(mainScssFilePath).ctimeMs;

	// 	expect(fileCreationTime2).toBe(fileCreationTime1);

	// 	fs.unlinkSync(path.join(tempDir, '_some-partial.scss'));

	// 	await pause(100);

	// 	buildSass(path.join(FIXTURES, 'partial'), {
	// 		outputDir: tempDir,
	// 	});

	// 	const fileCreationTime3 = fs.statSync(mainScssFilePath).ctimeMs;

	// 	expect(fileCreationTime3).toBeGreaterThan(fileCreationTime1);
	// 	expect(fileCreationTime3).toBeGreaterThan(fileCreationTime2);
	// });

	it('logs message if no files found', () => {
		expect(log).toBeCalledTimes(0);

		buildSass(path.join(FIXTURES, 'none'), {
			outputDir: tempDir,
		});

		expect(log).toBeCalledTimes(1);

		expect(log).toBeCalledWith('BUILD SASS: No scss files found.');
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

	it('builds with rtl support', () => {
		buildSass(path.join(FIXTURES, 'rtl'), {
			outputDir: tempDir,
			rtl: true,
		});

		expect(fs.existsSync(path.join(tempSassDir, 'main.css'))).toBe(true);
		expect(fs.existsSync(path.join(tempSassDir, 'main_rtl.css'))).toBe(
			true
		);

		expect(
			fs.readFileSync(path.join(tempSassDir, 'main.css'), 'utf-8')
		).toMatchSnapshot();

		expect(
			fs.readFileSync(path.join(tempSassDir, 'main_rtl.css'), 'utf-8')
		).toMatchInlineSnapshot(
			`".imported-rtl{float:right;}.swap-for-rtl{float:right;margin-left:2px;padding:1px 4px 3px 2px;right:5px;}"`
		);
	});

	it('builds with rtl support for nested files', () => {
		buildSass(path.join(FIXTURES, 'rtl'), {
			outputDir: tempDir,
			rtl: true,
		});
		expect(
			fs.existsSync(path.join(tempSassDir, 'nested', 'nested.css'))
		).toBe(true);
		expect(
			fs.existsSync(path.join(tempSassDir, 'nested', 'nested_rtl.css'))
		).toBe(true);

		expect(
			fs.readFileSync(
				path.join(tempSassDir, 'nested', 'nested.css'),
				'utf-8'
			)
		).toMatchSnapshot();

		expect(
			fs.readFileSync(
				path.join(tempSassDir, 'nested', 'nested_rtl.css'),
				'utf-8'
			)
		).toMatchInlineSnapshot(
			`".swap-for-rtl{float:right;margin-left:2px;padding:1px 4px 3px 2px;right:5px;}"`
		);
	});

	it('builds with rtl support for both .css and .scss files', () => {
		buildSass(path.join(FIXTURES, 'mixed-files'), {
			outputDir: tempDir,
			rtl: true,
		});

		expect(fs.existsSync(path.join(tempSassDir, 'main.css'))).toBe(true);
		expect(fs.existsSync(path.join(tempSassDir, 'main_rtl.css'))).toBe(
			true
		);

		expect(fs.existsSync(path.join(tempDir, 'app.css'))).toBe(true);
		expect(fs.existsSync(path.join(tempDir, 'app_rtl.css'))).toBe(true);

		expect(
			fs.readFileSync(path.join(tempDir, 'app.css'), 'utf-8')
		).toMatchSnapshot();
		expect(
			fs.readFileSync(path.join(tempDir, 'app_rtl.css'), 'utf-8')
		).toMatchSnapshot();
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
