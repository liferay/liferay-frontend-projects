/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/** Structure of `manifest.json` files */
export interface ManifestJson {
	packages: ManifestJsonPackages;
}

/** Structure of `packages` section of `manifest.json` files */
export interface ManifestJsonPackages {
	[index: string]: ManifestJsonPackage;
}

/** Structure of a package in `manifest.json` files */
export interface ManifestJsonPackage {
	src: ManifestJsonPackageDescriptor;
	dest: ManifestJsonPackageDescriptor;
	modules?: ManifestJsonModules;
}

/** Structure of a package descriptor in `manifest.json` files */
export interface ManifestJsonPackageDescriptor {
	id: string;
	name: string;
	version: string;
	dir: string;
}

/** Structure of a `modules` of package descriptor in `manifest.json` files */
export interface ManifestJsonModules {
	[index: string]: ManifestJsonModule;
}

/** Structure of a module in a package descriptor in `manifest.json` files */
export interface ManifestJsonModule {
	flags?: ManifestJsonModuleFlags;
}

/** Structure of module flags in package descriptor in `manifest.json` files */
export interface ManifestJsonModuleFlags {
	/** Module exports `__esModule` flag (as defined by Babel) */
	esModule?: boolean;
}

export default ManifestJson;
