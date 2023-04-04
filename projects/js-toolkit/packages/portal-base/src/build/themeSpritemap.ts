/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable @liferay/no-dynamic-require */

import {
	FilePath,
	Project,
	ThemeSpritemapBuildOptions,
	format,
} from '@liferay/js-toolkit-core';
import fs from 'fs';
import globby from 'globby';
import path from 'path';

import abort from '../util/abort';
import makeZip from '../util/makeZip';

const {info, print, warn} = format;

const HEADER_REGEXP = /<!--(.*)-->/s;

const SPRITEMAP_FILE_NAME = 'spritemap.svg';

export default async function themeSpritemap(project: Project): Promise<void> {
	const options = project.build.options as ThemeSpritemapBuildOptions;

	checkConfiguration(project);

	await buildProject(project);

	if (!project.isWorkspace) {
		const typeSettings = {
			enableSVG4Everybody: options.enableSVG4Everybody,
			url: SPRITEMAP_FILE_NAME,
		};

		await makeZip(project, 'themeSpritemap', typeSettings);
	}
}

function checkConfiguration(project: Project): void {
	if (!fs.existsSync(project.srcDir.asNative)) {
		abort(`Source directory ({${project.srcDir.asNative}}) doesn't exist.`);
	}
}

async function buildProject(project: Project): Promise<void> {
	const {extendClay} = project.build.options as ThemeSpritemapBuildOptions;

	print(info` Generating Spritemap:`);

	let svgContent =
		'<?xml version="1.0" encoding="UTF-8"?>' +
		'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' +
		'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">';

	if (extendClay) {
		const clayPath = project.resolve('@clayui/css');

		if (!fs.existsSync(clayPath)) {
			print(
				warn`@clay/css package not found. Add as a dependency to your client extension via npm.`
			);
		}

		const claySpritemapPath = project.resolve(
			'@clayui/css/lib/images/icons/icons.svg'
		);

		const claySpritemapContent = fs.readFileSync(claySpritemapPath, 'utf8');

		svgContent = claySpritemapContent
			.replace('</svg>', '')
			.replace(/\n/gm, '')
			.replace(/\t/gm, '');
	}

	const filePaths = globby
		.sync(['**/*.svg'], {
			cwd: project.srcDir.asNative,
		})
		.map((posixPath) => new FilePath(posixPath, {posix: true}))
		.map((file) => path.join(project.srcDir.asNative, file.asNative));

	if (!filePaths.length) {
		abort(`No icon(.svg) files found.`);
	}

	const iconsReplaced = [];

	for (const filePath of filePaths) {
		const fileName = path.basename(filePath, '.svg').toLowerCase();

		const data = fs.readFileSync(filePath, 'utf8');

		// Remove existing Clay icons that duplicate our new icon names

		if (extendClay) {
			const existingSymbolRegex = new RegExp(
				`<symbol id="${fileName}".*?</symbol>`,
				'gm'
			);

			if (existingSymbolRegex.test(svgContent)) {
				svgContent = svgContent.replace(existingSymbolRegex, '');

				iconsReplaced.push(fileName);
			}
		}

		let svgAttributes = /<svg\s+([^>]+)>/gm.exec(data)[1] || '';

		svgAttributes = svgAttributes
			.replace(/id=".*"?/, '')
			.replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/gm, ``);

		svgContent += data
			.replace(HEADER_REGEXP, '')
			.replace(/<svg.*?>/gm, `<symbol id="${fileName}" ${svgAttributes}>`)
			.replace(/<\/svg/gm, '</symbol')
			.replace(/\n/gm, '')
			.replace(/\t/gm, '');
	}

	const iconsAdded = filePaths.length - iconsReplaced.length;

	if (iconsAdded) {
		print(info` ${iconsAdded} new icons added.`);
	}

	if (extendClay) {
		print(
			info` Extended Clay spritemap and replaced ${
				iconsReplaced.length
			} icons: ${iconsReplaced.join(', ')}.`
		);
	}

	svgContent += '</svg>';

	fs.writeFileSync(
		path.join(project.build.dir.asNative, SPRITEMAP_FILE_NAME),
		svgContent
	);
}
