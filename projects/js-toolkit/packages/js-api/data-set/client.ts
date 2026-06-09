/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Typed surface of the Frontend Data Set runtime client.
 *
 * The sibling `index.ts` exposes only contracts. At runtime the FDS
 * connection is implemented and served by the portal as the
 * `@liferay/frontend-data-set-web/api` ES module and resolved through the
 * import map. A Client Extension redirects that import-map specifier to
 * this module at build time (via a `tsconfig` `paths` entry) so it can
 * `new FDSConnection(...)` with full typing while the value is pulled
 * from the import-map module at runtime.
 *
 * Unlike the contracts in `index.ts`, `FDSConnection` is declared here as
 * both a value (the constructor) and a type (the instance), so consumers
 * can `new FDSConnection(...)` and annotate with `FDSConnection` exactly
 * as they would a class.
 */

import type {
	FDSConnection as FDSConnectionInstance,
	FDSConnectionConstructor,
	FDSConnectionInfo,
	FDSConnectionOptions,
	FDSConnectionStatus,
	FDSStateChangeCallback,
} from './index';

// `FDSConnection` intentionally uses PascalCase: it is a class-like
// constructor (typed as `FDSConnectionConstructor` in `index.ts`), not a
// plain variable.

// eslint-disable-next-line @typescript-eslint/naming-convention
export declare const FDSConnection: FDSConnectionConstructor;

export type FDSConnection = FDSConnectionInstance;

export type {
	FDSConnectionInfo,
	FDSConnectionOptions,
	FDSConnectionStatus,
	FDSStateChangeCallback,
};
