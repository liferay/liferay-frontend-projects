/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import Manifest from 'liferay-npm-build-tools-common/lib/manifest';
import path from 'path';

import * as config from './config';

const manifest = new Manifest(
	path.join(config.getOutputDir(), 'manifest.json')
);

export default manifest;
