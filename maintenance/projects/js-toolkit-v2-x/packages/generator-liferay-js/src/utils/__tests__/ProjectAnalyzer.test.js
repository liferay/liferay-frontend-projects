/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import memFs from 'mem-fs';
import memFsEditor from 'mem-fs-editor';
import path from 'path';

import ProjectAnalyzer from '../ProjectAnalyzer';

let savedDir;

beforeEach(() => {
	savedDir = process.cwd();
});

afterEach(() => {
	process.chdir(savedDir);
});

it('name works', () => {
	process.chdir(path.join(__dirname, '__fixtures__', 'prj'));

	const projectAnalyzer = new ProjectAnalyzer({
		fs: memFsEditor.create(memFs.create()),
	});

	expect(projectAnalyzer.name).toBe('a-name');
});

describe('description', () => {
	it('works when set', () => {
		process.chdir(path.join(__dirname, '__fixtures__', 'prj'));

		const projectAnalyzer = new ProjectAnalyzer({
			fs: memFsEditor.create(memFs.create()),
		});

		expect(projectAnalyzer.description).toBe('A description');
	});

	it('returns empty string when missing', () => {
		process.chdir(
			path.join(__dirname, '__fixtures__', 'prj-without-description')
		);

		const projectAnalyzer = new ProjectAnalyzer({
			fs: memFsEditor.create(memFs.create()),
		});

		expect(projectAnalyzer.description).toBe('');
	});
});

describe('hasLocalization', () => {
	it('returns true when explicit configuration exists', () => {
		process.chdir(
			path.join(__dirname, '__fixtures__', 'prj-with-explicit-l10n')
		);

		const projectAnalyzer = new ProjectAnalyzer({
			fs: memFsEditor.create(memFs.create()),
		});

		expect(projectAnalyzer.hasLocalization).toBe(true);
	});

	it('returns true when implicit configuration exists', () => {
		process.chdir(
			path.join(__dirname, '__fixtures__', 'prj-with-implicit-l10n')
		);

		const projectAnalyzer = new ProjectAnalyzer({
			fs: memFsEditor.create(memFs.create()),
		});

		expect(projectAnalyzer.hasLocalization).toBe(true);
	});

	it('returns false when no configuration exists at all', () => {
		process.chdir(path.join(__dirname, '__fixtures__', 'prj-without-l10n'));

		const projectAnalyzer = new ProjectAnalyzer({
			fs: memFsEditor.create(memFs.create()),
		});

		expect(projectAnalyzer.hasLocalization).toBe(false);
	});
});

describe('localizationFilePath', () => {
	it('works when explicit configuration exists', () => {
		process.chdir(
			path.join(__dirname, '__fixtures__', 'prj-with-explicit-l10n')
		);

		const projectAnalyzer = new ProjectAnalyzer({
			fs: memFsEditor.create(memFs.create()),
		});

		expect(projectAnalyzer.localizationFilePath).toBe(
			'features/localization/MyKeys.properties'
		);
	});

	it('works when implicit configuration exists', () => {
		process.chdir(
			path.join(__dirname, '__fixtures__', 'prj-with-implicit-l10n')
		);

		const projectAnalyzer = new ProjectAnalyzer({
			fs: memFsEditor.create(memFs.create()),
		});

		expect(projectAnalyzer.localizationFilePath).toBe(
			'features/localization/Language.properties'
		);
	});

	it('returns undefined when no configuration exists at all', () => {
		process.chdir(path.join(__dirname, '__fixtures__', 'prj-without-l10n'));

		const projectAnalyzer = new ProjectAnalyzer({
			fs: memFsEditor.create(memFs.create()),
		});

		expect(projectAnalyzer.localizationFilePath).toBe(undefined);
	});
});
