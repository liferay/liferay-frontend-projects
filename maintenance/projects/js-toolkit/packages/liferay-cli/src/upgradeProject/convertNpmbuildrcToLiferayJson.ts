/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	FilePath,
	TRANSFORM_OPERATIONS,
	format,
	transformJsonFile,
	transformTextFile,
} from '@liferay/js-toolkit-core';
import fs from 'fs';

import safeReadJson from './safeReadJson';

const {
	LiferayJson: {setLiferayJsonDeployPath},
	Text: {appendLines, removeLines},
} = TRANSFORM_OPERATIONS;
const {print, success} = format;

export default async function convertNpmbuildrcToLiferayJson(): Promise<void> {
	const npmbuildrc = safeReadJson('.npmbuildrc');

	const deployPath = npmbuildrc['liferayDir']
		? `${npmbuildrc['liferayDir']}/osgi/modules`
		: undefined;

	const liferayJsonFile = ensureFile('.liferay.json', '{}');

	await transformJsonFile(
		liferayJsonFile,
		liferayJsonFile,
		setLiferayJsonDeployPath(deployPath)
	);

	const gitignoreFile = ensureFile('.gitignore');

	await transformTextFile(
		gitignoreFile,
		gitignoreFile,
		appendLines('/.liferay.json'),
		removeLines((line) => line.trim() === '/.npmbuildrc')
	);

	const npmignoreFile = ensureFile('.npmignore');

	await transformTextFile(
		npmignoreFile,
		npmignoreFile,
		appendLines('.liferay.json'),
		removeLines((line) => line.trim() === '.npmbuildrc')
	);

	fs.unlinkSync('.npmbuildrc');

	print(success`Converted {.npmbuildrc} to {.liferay.json}`);
}

function ensureFile(posixFilePath: string, initialContent = ''): FilePath {
	if (!fs.existsSync(posixFilePath)) {
		fs.writeFileSync(posixFilePath, initialContent);
	}

	return new FilePath(posixFilePath, {posix: true});
}
