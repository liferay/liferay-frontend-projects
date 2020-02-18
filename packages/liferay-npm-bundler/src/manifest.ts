/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import Manifest from 'liferay-npm-build-tools-common/lib/manifest';
import project from 'liferay-npm-build-tools-common/lib/project';

const manifest = new Manifest(project.buildDir.join('manifest.json').asNative);

export default manifest;
