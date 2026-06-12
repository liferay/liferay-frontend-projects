/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Public type contracts for the Frontend Data Set (FDS) connection and
 * remote state. `FDSConnection` (and its companion
 * `FDSConnectionConstructor`) let a Client Extension read and write FDS
 * search state, while `FDSConnectionInfo`, `FDSConnectionStatus`,
 * `FDSConnectionOptions`, and `FDSStateChangeCallback` describe how a
 * connection is opened and observed.
 *
 * Unlike the other contracts in this package, `FDSConnection` is declared
 * here as both a value (the constructor) and a type (the instance), so
 * consumers can `new FDSConnection(...)` and annotate with `FDSConnection`
 * exactly as they would a class. At runtime the connection is implemented
 * and served by the portal as the `@liferay/frontend-data-set-web/api` ES
 * module and resolved through the import map. A Client Extension redirects
 * that import-map specifier to this module at build time (via a `tsconfig`
 * `paths` entry) so it can construct a connection with full typing while
 * the value is pulled from the import-map module at runtime.
 */

export interface FDSState {
	search: {query: string};
}

export interface FDSStateChangeCallback {
	search: (query: string) => void;
}

export interface FDSConnectionOptions {
	timeout?: number;
}

export interface FDSConnectionInfo {
	fdsName: string;
	instanceId: number;
	status: FDSConnectionStatus;
}

export type FDSConnectionStatus =
	| 'connecting'
	| 'ready'
	| 'timeout'
	| 'disconnected';

export interface FDSConnection {
	disconnect: () => void;
	getSearch: () => string | null;
	setSearch: (query: string) => void;
}

export interface FDSConnectionConstructor {
	new (
		fdsName: string,
		fdsStateChangeCallback: FDSStateChangeCallback,
		onFDSConnectionInfoChange: (
			fdsConnectionInfo: FDSConnectionInfo
		) => void,
		options?: FDSConnectionOptions
	): FDSConnection;
}

// `FDSConnection` intentionally uses PascalCase: it is a class-like
// constructor (typed as `FDSConnectionConstructor`), not a plain variable.
// The `const` value and the `FDSConnection` interface above share the same
// name so consumers can use it as both a value and a type, like a class.

// eslint-disable-next-line @typescript-eslint/naming-convention
export declare const FDSConnection: FDSConnectionConstructor;
