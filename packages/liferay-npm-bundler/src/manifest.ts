/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import Manifest from 'liferay-npm-build-tools-common/lib/manifest';

import {buildBundlerDir} from './dirs';

const manifest = new Manifest(buildBundlerDir.join('manifest.json').asNative);

export default manifest;
