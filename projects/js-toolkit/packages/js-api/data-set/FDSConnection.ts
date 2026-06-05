/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {getFDSAtom, getOrCreateSelector} from './_internal';
import Atom = Liferay.State.Atom;
import {FDSState} from './index';

export interface FDSStateChangeCallback {
	search: (query: string) => void;
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

interface Subscriptions {
	search: {dispose: () => void};
}

interface Selectors {
	search: Liferay.State.Selector<string>;
}

export class FDSConnection {
	private static instanceCount = 0;

	private atom: Atom<FDSState>;
	private disconnected: boolean = false;
	private fdsName: string;
	private instanceId: number = ++FDSConnection.instanceCount;
	private isReady: boolean = false;
	private navigationHandle: {detach: () => void};
	private onFDSConnectionInfoChange: (
		fdsConnectionInfo: FDSConnectionInfo
	) => void;
	private selectors: Selectors;
	private subscriptions: Subscriptions;

	constructor(
		fdsName: string,
		fdsStateChangeCallbacks: FDSStateChangeCallback,
		onFDSConnectionInfoChange: (
			fdsConnectionInfo: FDSConnectionInfo
		) => void
	) {
		this.log('Creating FDSConnection for ' + fdsName);
		this.fdsName = fdsName;
		this.onFDSConnectionInfoChange = onFDSConnectionInfoChange;
		this.notifyStatus('connecting');

		getFDSAtom(fdsName, {timeout: 10000})
			.then((atom: Atom<FDSState>) => {
				if (this.disconnected) {
					this.log(
						'Atom available for ' +
							fdsName +
							' but ' +
							this.instanceId +
							' is already disconnected'
					);
					return;
				}

				this.log('Atom available for ' + fdsName);

				this.atom = atom;

				this.selectors = {
					search: getOrCreateSelector(
						`${atom.key}_searchQuery`,
						(get) => get(atom).search.query
					),
				};

				// mark connection as ready, so getters/setters are unblocked and available to callbacks

				this.isReady = true;

				this.subscriptions = {
					search: Liferay.State.subscribe(
						this.selectors.search,
						fdsStateChangeCallbacks.search
					),
				};

				// initialize consumer's state

				fdsStateChangeCallbacks.search(this.getSearch());

				// then inform consumer everything is settled

				this.notifyStatus('ready');
			})
			.catch((error: Error) => {
				if (this.disconnected) {
					return;
				}

				this.warn(
					'Connection timed out for ' + fdsName + ': ' + error.message
				);

				this.notifyStatus('timeout');
			});

		// ensure consumers don't need to dispose the subscriptions on SPA navigations

		this.navigationHandle = Liferay.on('beforeNavigate', () => {
			this.log('Calling before navigate callback');
			this.disconnect();
		});
	}

	getSearch = (): string | null => {
		if (!this.isReady) {
			return null;
		}

		return Liferay.State.read(this.selectors.search);
	};

	setSearch = (query: string) => {
		if (!this.isReady) {
			return;
		}

		const current = Liferay.State.read(this.atom);

		Liferay.State.write(this.atom, {
			...current,
			search: {...current.search, query},
		});
	};

	disconnect = () => {
		if (this.disconnected) {
			this.log('Already disconnected!');
			return;
		}
		this.log('Disconnecting');
		this.subscriptions?.search?.dispose();
		this.disconnected = true;
		this.isReady = false;
		this.navigationHandle.detach();
		this.notifyStatus('disconnected');
	};

	private log(msg: string) {
		console.log('[FDSConnection', this.instanceId, ']', msg);
	}

	private warn(msg: string) {
		console.warn('[FDSConnection', this.instanceId, ']', msg);
	}

	private notifyStatus(status: FDSConnectionStatus) {
		this.onFDSConnectionInfoChange({
			fdsName: this.fdsName,
			instanceId: this.instanceId,
			status,
		});
	}
}
