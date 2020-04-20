/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';

import {buildGeneratedDir} from '../../dirs';
import Renderer from '../../util/renderer';

export function renderTemplates(): void {
	const templatesPath = path.join(__dirname, project.probe.type, 'templates');

	const renderer = new Renderer(templatesPath, buildGeneratedDir.asNative);

	const {pkgJson} = project;

	renderer.render('adapt-rt.js', {
		project,
	});
	renderer.render('index.js', {
		pkgJson,
	});
}
