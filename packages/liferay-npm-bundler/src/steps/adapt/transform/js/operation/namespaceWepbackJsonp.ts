/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import crypto from 'crypto';
import project from 'liferay-npm-build-tools-common/lib/project';
import {SourceTransform} from 'liferay-npm-build-tools-common/lib/transform/js';
import replaceInStringLiterals from 'liferay-npm-build-tools-common/lib/transform/js/operation/replaceInStringLiterals';

export default function namespaceWepbackJsonp(): SourceTransform {
	const hash = crypto.createHash('MD5');

	const {name, version} = project.pkgJson;

	hash.update(name);
	hash.update(version);

	const uuid = hash
		.digest('base64')
		.replace(/\+/g, '_')
		.replace(/\//g, '_')
		.replace(/=/g, '');

	return replaceInStringLiterals('webpackJsonp', `webpackJsonp_${uuid}_`);
}
