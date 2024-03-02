/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
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
	SIGTERM: 15,
	exit: -1,
};

const SignalHandler = {
	install() {
		if (!installed) {
			Object.keys(SIGNALS).forEach((signal) => {
				process.on(signal, (code) => {
					log(`Received ${code}`);

					for (const callback of callbacks.values()) {
						try {
							callback();
						}
						catch (error) {
							log(`Caught error in signal callback: ${error}`);
						}
					}

					if (signal !== 'exit') {
						process.exit(128 + SIGNALS[code]);
					}
					else {
						process.exit(code);
					}
				});
			});

			installed = true;
		}
	},

	onExit(callback) {
		SignalHandler.install();

		return getDisposable(callback, index++);
	},
};

function getDisposable(callback, id) {
	callbacks.set(id, callback);

	return {
		dispose() {
			callback();

			callbacks.delete(id);
		},
	};
}

module.exports = SignalHandler;
