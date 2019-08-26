/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Event support APIs on the `Liferay` object inherited from `A.Attributes`
 *
 * Defines:
 * 	- Liferay.detach
 * 	- Liferay.fire
 * 	- Liferay.on
 *
 * https://github.com/liferay/liferay-portal/blob/master/modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/events.js#L66
 * https://yuilibrary.com/yui/docs/api/classes/Attribute.html
 */
const events = {
	/**
	 * https://yuilibrary.com/yui/docs/api/files/event-custom_js_event-target.js.html#l372
	 */
	detach: jest.fn(),

	/**
	 * https://yuilibrary.com/yui/docs/api/files/event-custom_js_event-target.js.html#l700
	 */
	fire: jest.fn(),

	/**
	 * https://yuilibrary.com/yui/docs/api/files/event-custom_js_event-target.js.html#l227
	 */
	on: jest.fn(),

	/**
	 * https://yuilibrary.com/yui/docs/api/files/event-custom_js_event-target.js.html#l136
	 */
	once: jest.fn()
};

/**
 * General utilities on the `Liferay`. Possible API sources are:
 *
 * - https://github.com/liferay/liferay-portal/blob/master/modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/global.es.js
 * - https://github.com/liferay/liferay-portal/blob/master/modules/apps/frontend-js/frontend-js-aui-web/src/main/resources/META-INF/resources/liferay/util.js
 */
const Util = {
	/**
	 * https://github.com/liferay/liferay-portal/blob/master/modules/apps/frontend-js/frontend-js-aui-web/src/main/resources/META-INF/resources/liferay/util.js#L442
	 */
	getGeolocation: jest.fn(),

	/**
	 * https://github.com/liferay/liferay-portal/blob/master/modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/util/navigate.es.js
	 */
	navigate: jest.fn(),

	/**
	 * https://github.com/liferay/liferay-portal/blob/master/modules/apps/frontend-js/frontend-js-web/test/liferay/util/ns.es.js
	 */
	ns: jest.fn()
};

module.exports = {
	...events,
	Util
};
