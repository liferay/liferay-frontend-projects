/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const {FilePath} = require('@liferay/js-toolkit-core');
const escapeStringRegexp = require('escape-string-regexp');
const globby = require('globby');
const project = require('liferay-npm-build-tools-common/lib/project');

const replaceTokens = require('../util/replaceTokens');

/**
 * A loader to rewrite static asset URLs inside a file (usually a webpack
 * generated bundle).
 *
 * This loader prepends the configured web context path to the static asset URLs
 * so that they can be retrieved from a Liferay server.
 *
 * The web context path is taken from property
 * [create-jar.features.web-context](https://github.com/liferay/liferay-frontend-projects/tree/master/maintenance/projects/js-toolkit/docs/.npmbundlerrc-file-reference.md#create-jarfeaturesweb-context).
 * inside `.npmbundlerrc`.
 *
 * @remarks
 * Valid options are:
 *
 *   - docroot: project relative path of directory containing assets
 *   - include: list of regexps to match assets that need their URL to be processed
 *   - prefix: prefix to add to file path (after 'o/${project.jar.webContextPath}/')
 *   - prependSlash: prepend a / to `o/${project.jar.webContextPath}/`
 *
 * @deprecated use `adapt-static-urls-at-runtime.ts` instead
 */
module.exports = function adaptStaticURLs(context, options) {
	const {content, log} = context;
	const {docroot, include, prefix = '', prependSlash = false} = replaceTokens(
		project.default,
		options
	);

	const docrootDir = project.default.dir.join(
		new FilePath(docroot, {posix: true}).asNative
	);

	const filePosixPaths = globby
		.sync(`${docrootDir.asPosix}/**`, {
			absolute: true,
			followSymbolicLinks: false,
			onlyFiles: true,
		})
		.map((filePath) => docrootDir.relative(filePath).asPosix);

	const patterns = Array.isArray(include)
		? include.map((item) => new RegExp(item))
		: [new RegExp(include)];

	let modifiedContent = content;

	filePosixPaths.forEach((filePosixPath) => {
		if (!patterns.some((pattern) => pattern.test(filePosixPath))) {
			return;
		}

		const regexp = new RegExp(escapeStringRegexp(filePosixPath), 'g');

		const matches = regexp.exec(content);

		if (!matches) {
			return;
		}

		log.info(
			'adapt-static-urls',
			`Adapted ${matches.length} occurrences of URL '${filePosixPath}'`
		);

		modifiedContent = modifiedContent.replace(
			regexp,
			(prependSlash ? '/' : '') +
				`o${project.default.jar.webContextPath}/${prefix}${filePosixPath}`
		);
	});

	return modifiedContent;
};
