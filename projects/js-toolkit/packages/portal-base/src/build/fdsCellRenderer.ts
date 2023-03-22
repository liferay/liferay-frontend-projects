/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable @liferay/no-dynamic-require */

import {FDSCellRendererBuildOptions, Project} from '@liferay/js-toolkit-core';

import copyAssets from '../util/copyAssets';
import getWebpackConfiguration from '../util/getWebpackConfiguration';
import makeZip from '../util/makeZip';
import runWebpack from '../util/runWebpack';

export default async function fdsCellRenderer(project: Project): Promise<void> {
	const options = project.build.options as FDSCellRendererBuildOptions;

	checkConfiguration(project);

	copyAssets(project);

	await buildProject(project);

	const typeSettings = {
		url: project.srcDir.relative(project.mainModuleFile).toDotRelative()
			.asPosix.replace(/\.tsx?$/, '.js')
	};

	await makeZip(project, 'fdsCellRenderer', typeSettings);
}

function checkConfiguration(project: Project): void {}

async function buildProject(project: Project): Promise<void> {
	await runWebpack(project, getWebpackConfiguration(project));
}
