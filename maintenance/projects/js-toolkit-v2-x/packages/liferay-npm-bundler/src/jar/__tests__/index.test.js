/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import JSZip from 'jszip';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';

import {addManifest} from '../index';

describe('addManifest', () => {
	it('includes Bundle-Version with valid simple classifier when provided', async () => {
		project.loadFrom(
			path.join(__dirname, '__fixtures__', 'project-simple-classifier')
		);

		const zip = new JSZip();

		addManifest(zip);

		const manifest = await zip
			.folder('META-INF')
			.file('MANIFEST.MF')
			.async('string');

		const bundleVersionLine = manifest
			.split('\n')
			.find((line) => line.startsWith('Bundle-Version: '));

		expect(bundleVersionLine).toEqual('Bundle-Version: 1.0.0.classifier');
	});

	it('includes Bundle-Version with valid extended classifier when provided', async () => {
		project.loadFrom(
			path.join(__dirname, '__fixtures__', 'project-extended-classifier')
		);

		const zip = new JSZip();

		addManifest(zip);

		const manifest = await zip
			.folder('META-INF')
			.file('MANIFEST.MF')
			.async('string');

		const bundleVersionLine = manifest
			.split('\n')
			.find((line) => line.startsWith('Bundle-Version: '));

		expect(bundleVersionLine).toEqual(
			'Bundle-Version: 1.0.0.classifier-1-2-3'
		);
	});
});
