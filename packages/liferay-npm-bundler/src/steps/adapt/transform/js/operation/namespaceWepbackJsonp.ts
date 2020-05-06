/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import crypto from 'crypto';
import project from 'liferay-js-toolkit-core/lib/project';
import {SourceTransform} from 'liferay-js-toolkit-core/lib/transform/js';
import replaceInStringLiterals from 'liferay-js-toolkit-core/lib/transform/js/operation/replaceInStringLiterals';

export default function namespaceWepbackJsonp(): SourceTransform {
	const hash = crypto.createHash('MD5');

	const {name, version} = project.pkgJson;

	hash.update(name);
	hash.update(version);

	const uuid = hash.digest('base64').replace(/[/+=]/g, '_');

	return replaceInStringLiterals('webpackJsonp', `webpackJsonp_${uuid}_`);
}
