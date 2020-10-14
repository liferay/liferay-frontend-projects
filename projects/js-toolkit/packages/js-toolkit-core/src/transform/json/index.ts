/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';

import FilePath from '../../file/FilePath';

export interface JsonTransform<T extends object> {
	(json: T): Promise<T>;
}

export async function transformJson<T extends object>(
	json: T,
	...transforms: JsonTransform<T>[]
): Promise<T> {
	return await transforms.reduce(
		async (jsonPromise, transform) => transform(await jsonPromise),
		Promise.resolve(json)
	);
}

/**
 * Transform a JSON file
 *
 * @param fromFile the source file to transform
 * @param toFile the destination file
 * @param transforms the transform functions to apply
 */
export async function transformJsonFile<T extends object>(
	fromFile: FilePath,
	toFile: FilePath,
	...transforms: JsonTransform<T>[]
): Promise<void> {
	let json = fs.readJsonSync(fromFile.asNative) as T;

	json = await transformJson<T>(json, ...transforms);

	fs.ensureDirSync(toFile.dirname().asNative);

	fs.writeJsonSync(toFile.asNative, json, {spaces: 2});
}
