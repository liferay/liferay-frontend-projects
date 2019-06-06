/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';

import {Project} from '../project';

let project;

describe('empty project', () => {
	beforeEach(() => {
		project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'empty')
		);
	});

	describe('project.jar', () => {
		it('returns customManifestHeaders', () => {
			expect(project.jar.customManifestHeaders).toEqual({});
		});
	});

	describe('project.l10n', () => {
		it('returns availableLocales', () => {
			expect(project.l10n.availableLocales).toEqual([]);
		});

		it('returns labels for default locale', () => {
			expect(project.l10n.getLabels()).toEqual({});
		});

		it('returns labels for missing locale', () => {
			expect(project.l10n.getLabels('fr_FR')).toEqual({});
		});

		it('returns supported', () => {
			expect(project.l10n.supported).toBe(false);
		});
	});
});

describe('standard project', () => {
	beforeEach(() => {
		project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'standard')
		);
	});

	describe('project.jar', () => {
		it('returns customManifestHeaders', () => {
			expect(project.jar.customManifestHeaders).toEqual({
				'Project-Name': 'Test Project',
				Responsible: 'john.doe@somewhere.net',
			});
		});
	});

	describe('project.l10n', () => {
		it('returns availableLocales', () => {
			expect(project.l10n.availableLocales).toEqual(['es_ES']);
		});

		it('returns labels for default locale', () => {
			expect(project.l10n.getLabels()).toEqual({
				'test-project': 'Test Project',
			});
		});

		it('returns labels for existing locale', () => {
			expect(project.l10n.getLabels('es_ES')).toEqual({
				'test-project': 'Proyecto de prueba',
			});
		});

		it('returns labels for missing locale', () => {
			expect(project.l10n.getLabels('fr_FR')).toEqual({});
		});

		it('returns supported', () => {
			expect(project.l10n.supported).toBe(true);
		});
	});
});
