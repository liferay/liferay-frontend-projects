/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import crypto from 'crypto';

import {
	BundlerLoaderContext,
	BundlerLoaderReturn,
} from 'liferay-npm-build-tools-common/lib/api/loaders';
import project from 'liferay-npm-build-tools-common/lib/project';

export default function({
	content,
	log,
}: BundlerLoaderContext): BundlerLoaderReturn {
	const regexp = /webpackJsonp/g;

	const matches = regexp.exec(content);

	if (!matches) {
		log.info(
			'namespace-webpack',
			`No ocurrences of 'webpackJsonp' found; nothing to be done`
		);

		return content;
	}

	log.info(
		'namespace-webpack',
		`Replaced ${matches.length} occurences of 'webpackJsonp'`
	);

	const hash = crypto.createHash('MD5');

	hash.update(project.pkgJson['name']);
	hash.update(project.pkgJson['version']);

	const uuid = hash
		.digest('base64')
		.replace(/\+/g, '_')
		.replace(/\//g, '_')
		.replace(/=/g, '');

	return content.replace(regexp, `webpackJsonp_${uuid}`);
}
