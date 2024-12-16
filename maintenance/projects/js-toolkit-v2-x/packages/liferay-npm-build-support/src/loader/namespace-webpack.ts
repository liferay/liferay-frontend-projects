/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import crypto from 'crypto';
import {
	BundlerLoaderContext,
	BundlerLoaderReturn,
} from 'liferay-npm-build-tools-common/lib/api/loaders';
import project from 'liferay-npm-build-tools-common/lib/project';

/**
 * A loader to namespace occurrences of the `webpackJsonp` variable.
 *
 * @remarks
 * This loader is used to avoid collisions when several webpack bundles are
 * deployed to the same page.
 *
 * It simply replaces all occurrences of `webpackJsonp` by
 * `webpackJsonp_${uuid}` where the `uuid` is derived from the project's name
 * and version.
 *
 * @deprecated Use the loader from @liferay/portal-adapt-base instead
 */
export default function (context: BundlerLoaderContext): BundlerLoaderReturn {
	const {content, log} = context;
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
