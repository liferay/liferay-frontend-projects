/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

export default interface ClientExtensionConfigJson {
	[configurationPid: string]: {
		baseURL: string;
		description: string;
		name: string;
		sourceCodeURL: string;
		type: 'customElement' | 'themeSpritemap';
		typeSettings: string[];
	};
}
