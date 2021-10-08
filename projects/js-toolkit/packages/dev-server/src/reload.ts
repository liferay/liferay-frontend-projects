/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* global EventSource, Liferay, location */

function setupLiveSession(): void {
	const source = new EventSource('/events');

	source.addEventListener(
		'open',
		() => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore

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
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore

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

export default (content: string): string => {
	return content.replace(
		CLOSE_BODY_TAG,
		`${RELOAD_SNIPPET}${CLOSE_BODY_TAG}`
	);
};
