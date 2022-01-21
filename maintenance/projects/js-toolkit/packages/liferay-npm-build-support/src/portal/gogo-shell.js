/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {Socket} from 'net';

const DEFAULT_CONNECT_OPTIONS = {
	host: '127.0.0.1',
	port: 11311,
};

/**
 *
 */
export default class extends Socket {

	/**
	 * @param {boolean} debug set to true to dump transmited data
	 */
	constructor({debug = false} = {}) {
		super({});

		this._debug = debug;
		this._active = false;
		this._lastResponse = undefined;
		this._lastCommand = undefined;
	}

	/**
	 * Connect to the console.
	 * @param {object} options for Socket.connect method
	 * @return {Promise} resolves when ready
	 */
	connect(options) {
		return new Promise((resolve, reject) => {
			this.once('connect', () => this._onConnect());

			super.connect({
				...DEFAULT_CONNECT_OPTIONS,
				...options,
			});

			this.once('error', reject);
			this.once('ready', () => {
				this.removeListener('error', reject);
				resolve();
			});
		});
	}

	/**
	 * Send a command to console.
	 * @param {string} command
	 * @param  {...string} args
	 * @return {Promise} resolves with the obtained response
	 */
	sendCommand(command, ...args) {
		return new Promise((resolve, reject) => {

			// Signal error if command is on its way

			if (this._active) {
				reject(
					new Error(
						'Only one command can be sent at a time. ' +
							'Current command: ' +
							`"${this._lastCommand.replace('\n', '')}"` +
							' has not finished.'
					)
				);

				return;
			}

			// Normalize arguments

			if (args.length) {
				command += ` ${args.join(' ')}`;
			}

			if (!command.endsWith('\n')) {
				command += '\n';
			}

			// Set command handler

			this.once('error', reject);
			this.once('prompt', (response) => {
				this.removeListener('error', reject);
				this._active = false;
				resolve(response);
			});

			// Send command

			this._lastResponse = '';
			this._lastCommand = command;
			this._active = true;
			this.write(command);
		});
	}

	/**
	 * Handler for connect event. Emits 'ready' event when everything is setup
	 * and running.
	 */
	_onConnect() {

		// Emit ready event on first prompt

		this.once('prompt', () => this.emit('ready'));

		// Attach data handlers

		this.on('data', (data) => this._debugDataListener(data));
		this.on('data', (data) => this._promptDataListener(data));

		// Write handshake chars so that telnet knows we are an VT220

		this.write(new Buffer([255, 251, 24]));
		this.write(new Buffer([255, 250, 24, 0, 86, 84, 50, 50, 48, 255, 240]));
	}

	/**
	 * Handler for debugging transmited data. Prints data to console when debug
	 * option is set.
	 * @param {Buffer} data a chunk of data
	 */
	_debugDataListener(data) {
		if (this._debug) {
			process.stdout.write(data.toString());
		}
	}

	/**
	 * Handler for prompt and responses. Emits a 'prompt' event with obtained
	 * response when the console replies to some command.
	 * @param {Buffer} data a chunk of data
	 */
	_promptDataListener(data) {
		const finished = data.toString().endsWith('g! ');

		this._lastResponse += data.toString();

		if (finished) {
			let lastResponse = this._lastResponse;

			if (this._lastCommand) {
				lastResponse = lastResponse.substr(
					this._lastCommand.length + 1
				);
			}
			lastResponse = lastResponse.substr(0, lastResponse.length - 3);

			this._lastResponse = lastResponse;

			this.emit('prompt', this._lastResponse);
		}
	}
}
