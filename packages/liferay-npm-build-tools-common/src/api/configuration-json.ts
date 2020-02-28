/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

export interface ConfigurationJson {
	portletInstance: PortletInstanceConfiguration;
	system: SystemConfiguration;
}

export interface PortletInstanceConfiguration {
	fields: {[name: string]: ConfigurationField};
}

export interface SystemConfiguration {
	category: string;
	fields: {[name: string]: ConfigurationField};
	name: string;
}

export interface ConfigurationField {
	default?: string;
	description?: string;
	name: string;
	options?: {[key: string]: string};
	repeatable?: boolean;
	required?: boolean;
	type: 'string' | 'number' | 'float' | 'boolean' | 'password';
}
