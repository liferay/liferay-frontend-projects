/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/** Minimal package.json structure description */
export default interface PkgJson {
	dependencies?: PkgJsonDependencies;
	description?: string;
	devDependencies?: PkgJsonDependencies;
	main?: string;
	name: string;
	peerDependencies?: PkgJsonDependencies;
	portlet?: PkgJsonPortletProperties;
	scripts?: PkgJsonScripts;
	version: string;
}

export interface PkgJsonDependencies {
	[pkgName: string]: string;
}

export interface PkgJsonPortletProperties {
	[property: string]: string | boolean;
}

export interface PkgJsonScripts {
	[name: string]: string;
}
