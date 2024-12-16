/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';
import os from 'os';

import FilePath from '../../file/FilePath';
import LiferayJson from '../../schema/LiferayJson';
import Project from './Project';

export type Location = 'home' | 'project' | 'user-project';

export type Options = {
	configProperty?: string;
	location?: Location;
};

export default function persist(
	project: Project,
	domain: string,
	property: string,
	options: Options = {location: 'user-project'}
): void {
	let {configProperty, location} = options;

	configProperty = configProperty ?? property;
	location = location ?? 'user-project';

	let file: FilePath;

	switch (location) {
		case 'home':
			file = new FilePath(os.homedir()).join('.liferay.json');
			break;

		case 'project':
			file = project.dir.join('liferay.json');
			break;

		case 'user-project':
			file = project.dir.join('.liferay.json');
			break;

		default:
			throw new Error(`Invalid location: ${location}`);
	}

	let liferayJson: LiferayJson = {};

	try {
		liferayJson = JSON.parse(fs.readFileSync(file.asNative, 'utf8'));
	}
	catch (error) {
		if (error.code !== 'ENOENT') {
			throw error;
		}
	}

	liferayJson[domain] = liferayJson[domain] || {};

	set(
		liferayJson,
		`${domain}.${configProperty}`,
		get(project, `${domain}.${property}`)?.toString()
	);

	fs.writeFileSync(
		file.asNative,
		JSON.stringify(liferayJson, null, '\t'),
		'utf8'
	);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function get(object: object, property: string): any {
	const parts = property.split('.');

	parts.forEach((part) => (object = object[part]));

	return object;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function set(object: object, property: string, value: any): void {
	const parts = property.split('.');

	for (let i = 0; i < parts.length - 1; i++) {
		const part = parts[i];

		if (object[part] === undefined) {
			object[part] = {};
		}

		object = object[part];
	}

	object[parts[parts.length - 1]] = value;
}
