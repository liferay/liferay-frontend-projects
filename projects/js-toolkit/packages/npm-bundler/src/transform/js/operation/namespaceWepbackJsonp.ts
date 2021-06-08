/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	JsSourceTransform,
	TRANSFORM_OPERATIONS,
} from '@liferay/js-toolkit-core';
import crypto from 'crypto';

import {project} from '../../../globals';

const {
	JsSource: {replaceInStringLiterals},
} = TRANSFORM_OPERATIONS;

export default function namespaceWepbackJsonp(): JsSourceTransform {
	const hash = crypto.createHash('MD5');

	const {name, version} = project.pkgJson;

	hash.update(name);
	hash.update(version);

	const uuid = hash.digest('base64').replace(/[/+=]/g, '_');

	return replaceInStringLiterals('webpackJsonp', `webpackJsonp_${uuid}_`);
}
