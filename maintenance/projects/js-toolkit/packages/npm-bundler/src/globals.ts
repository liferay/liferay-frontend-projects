/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {B3Project as Project, Manifest} from '@liferay/js-toolkit-core';
import fs from 'fs-extra';

export const manifest = new Manifest();

Project.WARN_ON_NPMBUNDLERRC = true;

export const project = new Project('.');

const {workDir} = project;

export const bundlerGeneratedDir = workDir.join('generated');
export const bundlerWebpackDir = workDir.join('webpack');

fs.ensureDirSync(project.outputDir.asNative);
fs.ensureDirSync(bundlerGeneratedDir.asNative);
fs.ensureDirSync(bundlerWebpackDir.asNative);
