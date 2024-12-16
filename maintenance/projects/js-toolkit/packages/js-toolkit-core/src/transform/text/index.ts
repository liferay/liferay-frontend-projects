/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';

import FilePath from '../../file/FilePath';

export interface TextTransform {
	(text: string): Promise<string>;
}

export async function transformText(
	text: string,
	...transforms: TextTransform[]
): Promise<string> {
	return await transforms.reduce(
		async (sourcePromise, transform) => transform(await sourcePromise),
		Promise.resolve(text)
	);
}

/**
 * Transform a text file
 *
 * @param fromFile the file to transform
 * @param toFile the destination file
 * @param transforms the transform functions to apply
 */
export async function transformTextFile(
	fromFile: FilePath,
	toFile: FilePath,
	...transforms: TextTransform[]
): Promise<void> {
	let text = fs.readFileSync(fromFile.asNative).toString();

	text = await transformText(text, ...transforms);

	fs.ensureDirSync(toFile.dirname().asNative);

	fs.writeFileSync(toFile.asNative, text);
}
