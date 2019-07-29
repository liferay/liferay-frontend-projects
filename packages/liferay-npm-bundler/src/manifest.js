/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import Manifest from 'liferay-npm-build-tools-common/lib/manifest';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';

const manifest = new Manifest(path.join(project.buildDir, 'manifest.json'));

export default manifest;
