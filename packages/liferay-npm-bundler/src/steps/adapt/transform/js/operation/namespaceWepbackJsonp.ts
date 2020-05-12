/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import crypto from 'crypto';
import {
	JsSourceTransform,
	replaceInStringLiterals,
} from 'liferay-js-toolkit-core';

import {project} from '../../../../../globals';

export default function namespaceWepbackJsonp(): JsSourceTransform {
	const hash = crypto.createHash('MD5');

	const {name, version} = project.pkgJson;

	hash.update(name);
	hash.update(version);

	const uuid = hash.digest('base64').replace(/[/+=]/g, '_');

	return replaceInStringLiterals('webpackJsonp', `webpackJsonp_${uuid}_`);
}
