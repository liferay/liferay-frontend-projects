/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

export interface ConfigurationJson {
	portletInstance: ConfigurationJsonPortletInstance;
	system: ConfigurationJsonSystem;
}

export interface ConfigurationJsonPortletInstance {
	fields: {[name: string]: ConfigurationJsonField};
}

export interface ConfigurationJsonSystem {
	category: string;
	fields: {[name: string]: ConfigurationJsonField};
	name: string;
}

export interface ConfigurationJsonField {
	default?: string;
	description?: string;
	name: string;
	options?: {[key: string]: string};
	repeatable?: boolean;
	required?: boolean;
	type: 'string' | 'number' | 'float' | 'boolean' | 'password';
}

export default ConfigurationJson;
