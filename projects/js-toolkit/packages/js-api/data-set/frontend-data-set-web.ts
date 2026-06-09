/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Type bridge for the Frontend Data Set runtime implementation.
 *
 * `@liferay/js-api/data-set` exposes only contracts. At runtime the FDS
 * connection is served by the portal as the
 * `@liferay/frontend-data-set-web/api` ES module and resolved through the
 * import map. Declaring that module here lets Client Extensions
 * `new FDSConnection(...)` with full typing while importing the value
 * from the import-map module, without authoring a local ambient
 * declaration of their own.
 *
 * This file is intentionally a script (no top-level `import`/`export`),
 * so `declare module` is an ambient declaration rather than a module
 * augmentation. Imports inside an ambient module must use the bare
 * package specifier rather than a relative path.
 */

declare module '@liferay/frontend-data-set-web/api' {
	import type {
		FDSConnection as FDSConnectionInstance,
		FDSConnectionConstructor,
		FDSConnectionInfo,
		FDSConnectionOptions,
		FDSConnectionStatus,
		FDSStateChangeCallback,
	} from '@liferay/js-api/data-set';

	export const FDSConnection: FDSConnectionConstructor;
	export type FDSConnection = FDSConnectionInstance;
	export {
		FDSConnectionInfo,
		FDSConnectionOptions,
		FDSConnectionStatus,
		FDSStateChangeCallback,
	};
}
