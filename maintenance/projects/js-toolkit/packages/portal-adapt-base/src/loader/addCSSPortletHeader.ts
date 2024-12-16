/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {FilePath} from '@liferay/js-toolkit-core';
import fs from 'fs';
import {
	BundlerLoaderContext,
	BundlerLoaderReturn,
} from 'liferay-npm-build-tools-common/lib/api/loaders';
import * as project from 'liferay-npm-build-tools-common/lib/project';

import replaceTokens from '../util/replaceTokens';

/** Configuration options for `add-css-portlet-header` loader */
export interface Options {

	/**
	 * Path to the CSS file to use as `header-portlet-css` property of the
	 * portlet.
	 */
	css: string;

	/**
	 * A path that refers to a file inside the project that must exist for the
	 * loader to be applied.
	 *
	 * Note that it can make use of the '*' glob expression inside the file
	 * name (just once). This is useful to ignore webpack hashes.
	 */
	onlyIf?: string;
}

/**
 * A loader that adds the `com.liferay.portlet.header-portlet-css` to the
 * `package.json` file.
 *
 * This loader allows adding a CSS file path to be used by the generated portlet
 * on the fly.
 *
 * It is normally used from adapted projects to inject the framework's generated
 * CSS file into the portlet.
 */
export default function addCSSPortletHeader(
	context: BundlerLoaderContext,
	options: Options
): BundlerLoaderReturn {
	const {content, log} = context;
	const {css, onlyIf} = replaceTokens(project.default, options);

	if (!isLoaderApplicable(onlyIf)) {
		return;
	}

	const pkgJson = JSON.parse(content);

	pkgJson['portlet'] = pkgJson['portlet'] || {};

	if (pkgJson['portlet']['com.liferay.portlet.header-portlet-css']) {
		log.warn(
			'add-css-portlet-header',
			'The package.json has a configured header-portlet-css entry, ' +
				'but it will be overwritten'
		);
	}

	pkgJson['portlet']['com.liferay.portlet.header-portlet-css'] = css;

	log.info('add-css-portlet-header', `Added ${css} as portlet CSS file`);

	return JSON.stringify(pkgJson, null, '\t');
}

function isLoaderApplicable(onlyIf?: string): boolean {
	if (!onlyIf) {
		return true;
	}

	const file = new FilePath(onlyIf, {posix: true});
	const basename = file.basename().asNative;

	if (basename.includes('*')) {
		const dirname = file.dirname();

		const outDir = project.default.dir.join(...dirname.asPosix.split('/'));

		if (!fs.existsSync(outDir.asNative)) {
			return false;
		}

		const [prefix, suffix] = basename.split('*');

		const found = fs
			.readdirSync(outDir.asNative)
			.find((item) => item.startsWith(prefix) && item.endsWith(suffix));

		if (!found) {
			return false;
		}
	}
	else {
		if (
			!fs.existsSync(
				project.default.dir.join(...file.asPosix.split('/')).asNative
			)
		) {
			return false;
		}
	}

	return true;
}
