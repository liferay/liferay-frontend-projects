/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/** Minimal package.json structure description */
export default interface PkgJson {
	name: string;
	version: string;
	description?: string;
	main?: string;
	portlet?: PkgJsonPortletProperties;
	dependencies?: PkgJsonDependencies;
	devDependencies?: PkgJsonDependencies;
	peerDependencies?: PkgJsonDependencies;
	scripts?: PkgJsonScripts;
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
