import cpFile from 'cp-file';
import * as fs from 'fs';
import plugin from '../index';

// Package descriptor used in tests
const pkg = {
	id: 'package@1.0.0',
	name: 'package',
	version: '1.0.0',
	dir:
		`${process.cwd()}/packages/` +
		`liferay-npm-bundler-plugin-replace-browser-modules/src/__tests__`,
};

// Package files used in tests
const pkgFiles = [
	'test-2.js.file',
	'test-browser-2.js.file',
	'test-browser.js.file',
	'test-main.js.file',
	'test.js.file',
];

// Restore package status prior to running each test
beforeEach(() => {
	pkgFiles.forEach(file => {
		cpFile.sync(`${pkg.dir}/sources/${file}`, `${pkg.dir}/${file}`);
	});
});

// Delete result files after running each test
afterEach(() => {
	pkgFiles.forEach(file => {
		try {
			fs.unlinkSync(`${pkg.dir}/${file}`);
		} catch (err) {}
	});
});

it('replaces main file with browser file', () => {
	const pkgJson = {
		name: pkg.name,
		version: pkg.version,
		main: 'test-main.js.file',
		browser: 'test-browser.js.file',
	};

	plugin({pkg}, {pkgJson});

	expect(
		fs.readFileSync(`${pkg.dir}/test-main.js.file`).toString()
	).toMatchSnapshot();
});

it('works with unpkg field too', () => {
	const pkgJson = {
		name: pkg.name,
		version: pkg.version,
		main: 'test-main.js.file',
		unpkg: 'test-browser.js.file',
	};

	plugin({pkg}, {pkgJson});

	expect(
		fs.readFileSync(`${pkg.dir}/test-main.js.file`).toString()
	).toMatchSnapshot();
});

it('works with jsdelivr field too', () => {
	const pkgJson = {
		name: pkg.name,
		version: pkg.version,
		main: 'test-main.js.file',
		jsdelivr: 'test-browser.js.file',
	};

	plugin({pkg}, {pkgJson});

	expect(
		fs.readFileSync(`${pkg.dir}/test-main.js.file`).toString()
	).toMatchSnapshot();
});

it('replaces server files with browser files', () => {
	const pkgJson = {
		name: pkg.name,
		version: pkg.version,
		browser: {
			'test-browser.js.file': 'test.js.file',
			'test-browser-2.js.file': 'test-2.js.file',
		},
	};

	plugin({pkg}, {pkgJson});

	expect(
		fs.readFileSync(`${pkg.dir}/test-browser.js.file`).toString()
	).toMatchSnapshot();
	expect(
		fs.readFileSync(`${pkg.dir}/test-browser-2.js.file`).toString()
	).toMatchSnapshot();
});

it('does replace ignored modules with empty objects', () => {
	const pkgJson = {
		name: pkg.name,
		version: pkg.version,
		main: 'main.js',
		browser: {
			'test-browser.js.file': false,
		},
	};

	plugin({pkg}, {pkgJson});

	expect(
		fs.readFileSync(`${pkg.dir}/test-browser.js.file`).toString()
	).toMatchSnapshot();
});

it('does not throw on inexistent files', () => {
	const pkgJson = {
		name: pkg.name,
		version: pkg.version,
		main: 'main.js',
		browser: 'non-existent-file.js',
	};

	plugin({pkg}, {pkgJson});
});
