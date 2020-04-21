/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';

import {buildBundlerDir, buildGeneratedDir} from '../../dirs';
import * as log from '../../log';
import Renderer from '../../util/renderer';
import {wrapModule} from '../../util/transform';

export async function renderTemplates(): Promise<void> {
	const renderer = new Renderer(
		path.join(__dirname, project.probe.type, 'templates')
	);

	const {pkgJson} = project;

	await renderAndWrapTemplate(renderer, 'adapt-rt.js', {
		project,
	});
	await renderAndWrapTemplate(renderer, 'index.js', {
		pkgJson,
	});
}

async function renderAndWrapTemplate(
	renderer: Renderer,
	templatePath: string,
	data: object
): Promise<void> {
	const renderedCode = await renderer.render(templatePath, data);

	fs.writeFileSync(
		buildGeneratedDir.join(templatePath).asNative,
		renderedCode
	);

	const {name, version} = project.pkgJson;
	const moduleName = templatePath.replace(/\.js$/gi, '');

	fs.writeFileSync(
		buildBundlerDir.join(templatePath).asNative,
		await wrapModule(`${name}@${version}/${moduleName}`, renderedCode)
	);

	log.debug(`Rendered ${templatePath} adapter module`);
}
