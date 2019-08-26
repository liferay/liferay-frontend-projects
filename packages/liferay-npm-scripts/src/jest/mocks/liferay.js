/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const authToken = 'default-mocked-auth-token';

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
 * Contains a fallback/dummy implementation of `Liferay.Language.get`. In practice, this call is rewritten in a ServerFilter, so runtime calls to
 * `Liferay.Language.get` should not be found in production code. A better match for the real behaviour would be a babel plugin to rewrite calls
 * to the API with their "translated" value.
 *
 * https://github.com/liferay/liferay-portal/blob/master/modules/apps/frontend-js/frontend-js-aui-web/src/main/resources/META-INF/resources/liferay/language.js
 */
const Language = {
	/**
	 * https://github.com/liferay/liferay-portal/blob/master/modules/apps/frontend-js/frontend-js-aui-web/src/main/resources/META-INF/resources/liferay/language.js#L18
	 */
	get: jest.fn(key => key)
};

/**
 * Contains APIs that provide information about the running context of the portal. The JS ThemeDisplay object is a representation of its Java counterpart
 * simplified for JS access.
 *
 * https://github.com/liferay/liferay-portal/blob/master/portal-web/docroot/html/common/themes/top_js.jspf#L147
 */
const ThemeDisplay = {
	/**
	 * https://github.com/liferay/liferay-portal/blob/master/portal-web/docroot/html/common/themes/top_js.jspf#L217
	 */
	getDoAsUserIdEncoded: jest.fn(_ => 'default-mocked-do-as-user-id'),

	/**
	 * https://github.com/liferay/liferay-portal/blob/master/portal-web/docroot/html/common/themes/top_js.jspf#L235
	 */
	getPathMain: jest.fn(_ => '/c'),

	/**
	 * https://github.com/liferay/liferay-portal/blob/master/portal-web/docroot/html/common/themes/top_js.jspf#L238
	 */
	getPathThemeImages: jest.fn(_ => ''),

	/**
	 * https://github.com/liferay/liferay-portal/blob/master/portal-web/docroot/html/common/themes/top_js.jspf#L247
	 */
	getPortalURL: jest.fn(_ => 'http://localhost:8080')
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
	Language,
	ThemeDisplay,
	Util,
	authToken
};
