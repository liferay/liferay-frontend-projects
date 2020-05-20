/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import {Manifest, Project} from 'liferay-js-toolkit-core';

export const manifest = new Manifest();

export const project = new Project('.');

// TODO: provide abs and project relative paths to dirs directly in the Project
// object to avoid this globals and lots of join()s in the rest of the code
export const buildBundlerDir = project.workDir
	? project.buildDir
	: project.buildDir.join('output');
export const buildGeneratedDir = project.workDir
	? project.workDir.join('generated')
	: project.buildDir.join('generated');
export const buildWebpackDir = project.workDir
	? project.workDir.join('webpack')
	: project.buildDir.join('webpack');

export const srcDir = project.dir.join(project.srcDir);

fs.ensureDirSync(buildBundlerDir.asNative);
fs.ensureDirSync(buildGeneratedDir.asNative);
fs.ensureDirSync(buildWebpackDir.asNative);
