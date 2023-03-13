/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable @liferay/no-dynamic-require */

import {
	ClientExtensionConfigJson,
	FilePath,
	Project,
	ThemeSpritemapBuildOptions,
	format,
} from '@liferay/js-toolkit-core';
import fs from 'fs';
import globby from 'globby';
import JSZip from 'jszip';
import path from 'path';

import abort from '../util/abort';

const {error, info, print} = format;

const HEADER_REGEXP = /<!--(.*)-->/s;

const SPRITEMAP_FILE_NAME = 'spritemap.svg';

export default async function themeSpritemap(project: Project): Promise<void> {
	const {enableSVG4Everybody, extendClay} = project.build
		.options as ThemeSpritemapBuildOptions;

	fs.mkdirSync(project.build.dir.asNative, {recursive: true});

	print(info` Generating Spritemap:`);

	if (!fs.existsSync(project.srcDir.asNative)) {
		abort(`Source directory, (${project.srcDir.asNative}), doesn't exist.`);
	}

	let svgContent =
		'<?xml version="1.0" encoding="UTF-8"?>' +
		'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' +
		'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">';

	if (extendClay) {
		const clayPath = project.resolve('@clayui/css');

		if (!fs.existsSync(clayPath)) {
			print(
				error` @clay/css package not found. Add as a dependency to your client extension via npm.`
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

		svgContent += data
			.replace(HEADER_REGEXP, '')
			.replace(/<svg/gm, '<symbol')
			.replace(
				/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/gm,
				`id="${fileName}"`
			)
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

	const configurationPid =
		'com.liferay.client.extension.type.configuration.CETConfiguration~' +
		project.pkgJson.name;

	const clientExtensionConfigJson: ClientExtensionConfigJson = {
		[configurationPid]: {
			baseURL: `\${portalURL}/o/${project.pkgJson.name}`,
			description: project.pkgJson.description || '',
			name: project.pkgJson.name,
			sourceCodeURL: '',
			type: 'themeSpritemap',
			typeSettings: [
				`enableSVG4Everybody=${enableSVG4Everybody}`,
				`url=${SPRITEMAP_FILE_NAME}`,
			],
		},
	};

	const zip = new JSZip();

	zip.file(
		`${project.pkgJson.name}.client-extension-config.json`,
		JSON.stringify(clientExtensionConfigJson, null, '\t')
	);

	const staticFolder = zip.folder('static');

	staticFolder.file(SPRITEMAP_FILE_NAME, svgContent);

	const buffer = await zip.generateAsync({
		compression: 'DEFLATE',
		compressionOptions: {
			level: 6,
		},
		type: 'nodebuffer',
	});

	fs.mkdirSync(project.dist.dir.asNative, {recursive: true});

	fs.writeFileSync(project.dist.file.asNative, buffer);
}
