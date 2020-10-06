/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/** Structure of `manifest.json` files */
export interface Manifest {
	packages: Packages;
}

/** Structure of `packages` section of `manifest.json` files */
export interface Packages {
	[index: string]: Package;
}

/** Structure of a package in `manifest.json` files */
export interface Package {
	src: PackageDescriptor;
	dest: PackageDescriptor;
	modules?: Modules;
}

/** Structure of a package descriptor in `manifest.json` files */
export interface PackageDescriptor {
	id: string;
	name: string;
	version: string;
	dir: string;
}

/** Structure of a `modules` of package descriptor in `manifest.json` files */
export interface Modules {
	[index: string]: Module;
}

/** Structure of a module in a package descriptor in `manifest.json` files */
export interface Module {
	flags?: ModuleFlags;
}

/** Structure of module flags in package descriptor in `manifest.json` files */
export interface ModuleFlags {
	/** Module exports `__esModule` flag (as defined by Babel) */
	esModule?: boolean;
}
