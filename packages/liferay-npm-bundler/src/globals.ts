/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import {Manifest, Project} from 'liferay-js-toolkit-core';

export const manifest = new Manifest();

export const project = new Project('.');

const {workDir} = project;

export const bundlerGeneratedDir = workDir.join('bundler', 'generated');
export const bundlerWebpackDir = workDir.join('bundler', 'webpack');

fs.ensureDirSync(project.outputDir.asNative);
fs.ensureDirSync(bundlerGeneratedDir.asNative);
fs.ensureDirSync(bundlerWebpackDir.asNative);
