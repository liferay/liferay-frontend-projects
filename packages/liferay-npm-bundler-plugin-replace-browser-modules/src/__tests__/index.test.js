/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import * as fs from 'fs-extra';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';
import rcopy from 'recursive-copy';
import plugin from '../index';

// Package descriptor used in tests
const pkg = {
	id: 'package@1.0.0',
	name: 'package',
	version: '1.0.0',
	dir: `${__dirname}/pkg`,
};

let log;

// Restore package status prior to running each test
beforeEach(done => {
	log = new PluginLogger();

	rcopy(`${__dirname}/__fixtures__`, pkg.dir, {overwrite: true}).then(done);
});

// Delete result files after running each test
afterEach(() => {
	fs.emptyDirSync(pkg.dir);
	fs.rmdirSync(pkg.dir);
});

it('logs results correctly', () => {
	const pkgJson = {
		name: pkg.name,
		version: pkg.version,
		main: 'test-main.js',
		browser: 'test-browser.js',
	};

	plugin({pkg, log}, {pkgJson});

	expect(log.messages).toMatchSnapshot();
});

it('replaces main file with browser file', () => {
	const pkgJson = {
		name: pkg.name,
		version: pkg.version,
		main: 'test-main.js',
		browser: 'test-browser.js',
	};

	plugin({pkg, log}, {pkgJson});

	expect(
		fs.readFileSync(`${pkg.dir}/test-main.js`).toString()
	).toMatchSnapshot();
});

it('replaces main directory with browser file', () => {
	const pkgJson = {
		name: pkg.name,
		version: pkg.version,
		main: './dir',
		browser: 'test-browser.js',
	};

	plugin({pkg, log}, {pkgJson});

	expect(
		fs.readFileSync(`${pkg.dir}/dir/index.js`).toString()
	).toMatchSnapshot();
});

it('works with unpkg field too', () => {
	const pkgJson = {
		name: pkg.name,
		version: pkg.version,
		main: 'test-main.js',
		unpkg: 'test-browser.js',
	};

	plugin({pkg, log}, {pkgJson});

	expect(
		fs.readFileSync(`${pkg.dir}/test-main.js`).toString()
	).toMatchSnapshot();
});

it('works with jsdelivr field too', () => {
	const pkgJson = {
		name: pkg.name,
		version: pkg.version,
		main: 'test-main.js',
		jsdelivr: 'test-browser.js',
	};

	plugin({pkg, log}, {pkgJson});

	expect(
		fs.readFileSync(`${pkg.dir}/test-main.js`).toString()
	).toMatchSnapshot();
});

it('replaces server files with browser files', () => {
	const pkgJson = {
		name: pkg.name,
		version: pkg.version,
		browser: {
			dir: 'test-main.js',
			'test-browser.js': 'test.js',
			'test-browser-2.js': 'test-2.js',
		},
	};

	plugin({pkg, log}, {pkgJson});

	expect(
		fs.readFileSync(`${pkg.dir}/dir/index.js`).toString()
	).toMatchSnapshot();
	expect(
		fs.readFileSync(`${pkg.dir}/test-browser.js`).toString()
	).toMatchSnapshot();
	expect(
		fs.readFileSync(`${pkg.dir}/test-browser-2.js`).toString()
	).toMatchSnapshot();
});

it('does replace ignored modules with empty objects', () => {
	const pkgJson = {
		name: pkg.name,
		version: pkg.version,
		main: 'main.js',
		browser: {
			'test-browser.js': false,
		},
	};

	plugin({pkg, log}, {pkgJson});

	expect(
		fs.readFileSync(`${pkg.dir}/test-browser.js`).toString()
	).toMatchSnapshot();
});

describe('works well with non-existent files', () => {
	it('when browser field has a unique file', () => {
		const pkgJson = {
			name: pkg.name,
			version: pkg.version,
			main: 'main.js',
			browser: 'non-existent-file.js',
		};

		plugin({pkg, log}, {pkgJson});

		expect(
			fs.readFileSync(`${pkg.dir}/main.js`).toString()
		).toMatchSnapshot();
	});

	it('when browser field has several files', () => {
		const pkgJson = {
			name: pkg.name,
			version: pkg.version,
			main: 'main.js',
			browser: {
				'non-existent-file.js': false,
				'non-existent-dir/non-existent-file-in-dir.js': false,
				'non-existent-file-2.js': 'test-browser.js',
				'non-existent-file-3.js': 'non-existent-file-4.js',
			},
		};

		plugin({pkg, log}, {pkgJson});

		expect(
			fs.readFileSync(`${pkg.dir}/non-existent-file.js`).toString()
		).toMatchSnapshot();
		expect(
			fs
				.readFileSync(
					`${pkg.dir}/non-existent-dir/non-existent-file-in-dir.js`
				)
				.toString()
		).toMatchSnapshot();
		expect(
			fs.readFileSync(`${pkg.dir}/non-existent-file-2.js`).toString()
		).toMatchSnapshot();
		expect(
			fs.readFileSync(`${pkg.dir}/non-existent-file-3.js`).toString()
		).toMatchSnapshot();
	});
});
