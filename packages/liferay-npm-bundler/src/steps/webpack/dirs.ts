/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import FilePath from 'liferay-npm-build-tools-common/lib/file-path';

export const buildGeneratedDir = new FilePath('build/generated', {posix: true});
export const buildWebpackDir = new FilePath('build/webpack', {posix: true});
