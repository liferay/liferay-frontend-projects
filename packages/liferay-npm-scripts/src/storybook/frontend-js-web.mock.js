/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

/* eslint-disable no-console */

module.exports = {
	cancelDebounce: () => {},
	CompatibilityEventProxy: () => {},
	DefaultEventHandler: () => {},
	debounce: fn => fn,
	fetch,
	ItemSelectorDialog: () => {},
	Modal: () => {},
	openSimpleInputModal: config => console.log(config),
	openToast: config => console.log(config),
	navigate: (url, listeners) => console.log({url, listeners}),
	PortletBase: () => {},
	Slider: () => {},
	Treeview: () => {}
};

/* eslint-enable no-console */
