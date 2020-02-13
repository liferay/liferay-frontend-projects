/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/* eslint-disable no-console */

module.exports = {
	CompatibilityEventProxy: () => {},
	DefaultEventHandler: () => {},
	ItemSelectorDialog: () => {},
	Modal: () => {},
	PortletBase: () => {},
	Slider: () => {},
	Treeview: () => {},
	cancelDebounce: () => {},
	debounce: fn => fn,
	fetch,
	navigate: (url, listeners) => console.log({listeners, url}),
	openSimpleInputModal: config => console.log(config),
	openToast: config => console.log(config),
};

/* eslint-enable no-console */
