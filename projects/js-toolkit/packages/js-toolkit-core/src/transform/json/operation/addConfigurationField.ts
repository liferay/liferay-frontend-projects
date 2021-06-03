/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {JsonTransform} from '..';

import ConfigurationJson, {
	ConfigurationJsonField,
} from '../../../schema/ConfigurationJson';

/**
 * Add a field to a configuration.json file
 */
export default function addConfigurationField(
	section: 'system' | 'portletInstance',
	name: string,
	field: ConfigurationJsonField
): JsonTransform<ConfigurationJson> {
	return (async (configurationJson) => {
		configurationJson[section].fields = {
			...configurationJson[section].fields,
			[name]: field,
		};

		return configurationJson;
	}) as JsonTransform<ConfigurationJson>;
}
