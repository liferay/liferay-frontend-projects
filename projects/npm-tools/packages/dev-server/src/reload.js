/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/* global EventSource, Liferay, location */

function setupLiveSession() {
	var source = new EventSource('/events');

	source.addEventListener(
		'open',
		() => {
			Liferay.Util.openToast({
				message: 'Session successfully connected to live-reload server',
			});
		},
		false
	);

	source.addEventListener(
		'message',
		({data}) => {
			if (data === 'changes') {
				Liferay.Util.openToast({
					message:
						'Changes detected. Browser will reload momentarily...',
					type: 'warning',
				});
			}

			if (data === 'reload') {
				location.reload();
			}
		},
		false
	);
}

const CLOSE_BODY_TAG = '</body>';
const RELOAD_SNIPPET = `<script>(${setupLiveSession.toString()})();</script>`;

module.exports = (content) => {
	return content.replace(
		CLOSE_BODY_TAG,
		`${RELOAD_SNIPPET}${CLOSE_BODY_TAG}`
	);
};
