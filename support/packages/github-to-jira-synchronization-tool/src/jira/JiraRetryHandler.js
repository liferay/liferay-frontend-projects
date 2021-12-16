/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const path = require('path');

const isJiraUp = require('../utils/isJiraUp');

module.exports = class JiraRetryHandler {
	static FILE_PATH = path.resolve(__dirname, '../../pending-retries.json');
	static RETRY_DELAY = 1 * 60 * 60 * 1000;

	constructor() {
		this.pendingWebhooks = this._readFile();
	}

	async addPendingWebhook(name, payload) {
		this.pendingWebhooks.push({
			name,
			payload,
		});

		await this._writeFile();
	}

	shouldRetry(error) {
		if (error.response?.statusCode >= 500) {
			return true;
		}

		if (
			error.cause?.code === 'ESOCKETTIMEDOUT' ||
			error.cause?.code === 'ECONNREFUSED'
		) {
			return true;
		}

		return false;
	}

	start(retryPendingHookFn) {
		const retry = async () => {
			let pendingWebhooks = this.pendingWebhooks.length;

			if (pendingWebhooks === 0) {
				return;
			}

			const jiraUp = await isJiraUp();

			if (!jiraUp) {
				return;
			}

			while (pendingWebhooks > 0) {
				pendingWebhooks--;

				const {name, payload} = await this._getNextPendingWebhook();

				retryPendingHookFn(name, payload);
			}
		};

		setInterval(retry, JiraRetryHandler.RETRY_DELAY);
	}

	async _getNextPendingWebhook() {
		if (this.pendingWebhooks.length === 0) {
			return null;
		}

		const [nextPendingWebhook, ...rest] = this.pendingWebhooks;

		this.pendingWebhooks = rest;
		await this._writeFile();

		return nextPendingWebhook;
	}

	_readFile() {
		if (fs.existsSync(JiraRetryHandler.FILE_PATH)) {
			try {
				const content = fs.readFileSync(
					JiraRetryHandler.FILE_PATH,
					'utf-8'
				);

				return JSON.parse(content);
			}
			catch (_error) {
				return [];
			}
		}

		return [];
	}

	_writeFile() {
		return fs.promises.writeFile(
			JiraRetryHandler.FILE_PATH,
			JSON.stringify(this.pendingWebhooks)
		);
	}
};
