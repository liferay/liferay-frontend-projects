/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const log = require('./log');

let installed = false;

let index = 0;

const callbacks = new Map();

const SIGNALS = {
	SIGHUP: 1,
	SIGINT: 2,
	SIGQUIT: 3,
	SIGTERM: 15
};

const SignalHandler = {
	install() {
		if (!installed) {
			Object.keys(SIGNALS).forEach(signal => {
				process.on(signal, handleSignal);
			});

			installed = true;
		}
	},

	onExit(callback) {
		SignalHandler.install();

		return getDisposable(callback, index++);
	}
};

function getDisposable(callback, id) {
	callbacks.set(id, callback);

	return {
		dispose() {
			callback();

			callbacks.delete(id);
		}
	};
}

function handleSignal(signal) {
	log(`Received ${signal}`);

	/* eslint-disable-next-line no-for-of-loops/no-for-of-loops */
	for (const callback of callbacks.values()) {
		try {
			callback();
		} catch (error) {
			log(`Caught error in signal callback: ${error}`);
		}
	}

	process.exit(128 + SIGNALS[signal]);
}

module.exports = SignalHandler;
