/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import project from 'liferay-npm-build-tools-common/lib/project';

export const buildBundlerDir = project.buildDir.join('bundler');
export const buildGeneratedDir = project.buildDir.join('generated');
export const buildWebpackDir = project.buildDir.join('webpack');

fs.ensureDirSync(buildBundlerDir.asNative);
fs.ensureDirSync(buildGeneratedDir.asNative);
fs.ensureDirSync(buildWebpackDir.asNative);
