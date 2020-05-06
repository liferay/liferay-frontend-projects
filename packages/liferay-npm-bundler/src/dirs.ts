/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import project from 'liferay-js-toolkit-core/lib/project';

export const buildBundlerDir = project.workDir
	? project.buildDir
	: project.buildDir.join('output');
export const buildGeneratedDir = project.workDir
	? project.workDir.join('generated')
	: project.buildDir.join('generated');
export const buildWebpackDir = project.workDir
	? project.workDir.join('webpack')
	: project.buildDir.join('webpack');

fs.ensureDirSync(buildBundlerDir.asNative);
fs.ensureDirSync(buildGeneratedDir.asNative);
fs.ensureDirSync(buildWebpackDir.asNative);
