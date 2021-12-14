/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';
import project from 'liferay-npm-build-tools-common/lib/project';
import os from 'os';
import path from 'path';

export type Command = 'deploy';
export type ConfigurationValue = boolean | number | object | string;

export interface Configuration {
	deploy?: {
		liferayDir?: string;
	};
}

const CONFIGURATION_FILE = '.liferay.json';
const configuration = load();

export function get(command: Command, key: string): ConfigurationValue {
	configuration[command] = configuration[command] || {};

	return configuration[command][key];
}

function load(): Configuration {
	let configuration: Configuration = {};

	[
		project.dir.join(CONFIGURATION_FILE).asNative,
		path.join(os.homedir(), '.liferay.json'),
	].forEach((liferayJsonPath) => {
		try {
			configuration = {
				...configuration,
				...JSON.parse(fs.readFileSync(liferayJsonPath, 'utf8')),
			};
		}
		catch (error) {
			if (error.code !== 'ENOENT') {
				throw error;
			}
		}
	});

	return configuration;
}

function save(): void {
	fs.writeFileSync(
		project.dir.join(CONFIGURATION_FILE).asNative,
		JSON.stringify(configuration, null, '\t'),
		'utf8'
	);
}

export function set(
	command: Command,
	key: string,
	value: ConfigurationValue
): void {
	configuration[command] = configuration[command] || {};
	configuration[command][key] = value;

	save();
}
