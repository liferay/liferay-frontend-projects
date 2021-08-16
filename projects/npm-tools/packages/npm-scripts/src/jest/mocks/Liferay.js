/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/* eslint-env jest */

const authToken = 'default-mocked-auth-token';

/**
 * https://github.com/liferay/liferay-portal/blob/21d88b8a5cbbf6bfcbb752b5312b2be4fb106761/modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/component.es.js#L203
 */
const component = jest.fn(() => {});

/**
 * https://github.com/liferay/liferay-portal/blob/21d88b8a5cbbf6bfcbb752b5312b2be4fb106761/modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/component.es.js#L305
 */
const destroyComponent = jest.fn();

/**
 * Event support APIs on the `Liferay` object inherited from `A.Attributes`
 *
 * https://github.com/liferay/liferay-portal/blob/31073fb75fb0d3b309f9e0f921cb7a469aa2703d/modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/events.js#L66
 * https://yuilibrary.com/yui/docs/api/classes/Attribute.html
 */
const events = {

	/**
	 * https://clarle.github.io/yui3/yui/docs/api/files/event-custom_js_event-target.js.html#l850
	 */
	after: jest.fn(),

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
	once: jest.fn(),
};

/**
 * Contains a fallback/dummy implementation of
 * `Liferay.Language.get`. In practice, this call is rewritten in a
 * ServerFilter, so runtime calls to `Liferay.Language.get` should not
 * be found in production code. A better match for the real behaviour
 * would be a babel plugin to rewrite calls to the API with their
 * "translated" value.
 *
 * https://github.com/liferay/liferay-portal/blob/31073fb75fb0d3b309f9e0f921cb7a469aa2703d/modules/apps/frontend-js/frontend-js-aui-web/src/main/resources/META-INF/resources/liferay/language.js
 */
const Language = {

	/**
	 * https://github.com/liferay/liferay-portal/blob/f5bc2504a4f666241363a30975b6de5d57a6f627/portal-web/docroot/html/common/themes/top_js.jspf#L153
	 */
	available: {
		ar_SA: 'Arabic (Saudi Arabia)',
		ca_ES: 'Catalan (Spain)',
		de_DE: 'German (Germany)',
		en_US: 'English (United States)',
		es_ES: 'Spanish (Spain)',
		fi_FI: 'Finnish (Finland)',
		fr_FR: 'French (France)',
		hu_HU: 'Hungarian (Hungary)',
		ja_JP: 'Japanese (Japan)',
		nl_NL: 'Dutch (Netherlands)',
		pt_BR: 'Portuguese (Brazil)',
		sv_SE: 'Swedish (Sweden)',
		zh_CN: 'Chinese (China)',
	},

	/**
	 * https://github.com/liferay/liferay-portal/blob/31073fb75fb0d3b309f9e0f921cb7a469aa2703d/modules/apps/frontend-js/frontend-js-aui-web/src/main/resources/META-INF/resources/liferay/language.js#L18
	 */
	get: jest.fn((key) => key),
};

/**
 * https://github.com/liferay/liferay-portal/blob/f5bc2504a4f666241363a30975b6de5d57a6f627/portal-web/docroot/html/common/themes/top_js.jspf#L161
 */
const PortletKeys = {
	DOCUMENT_LIBRARY: 'DOCUMENT_LIBRARY',
	DYNAMIC_DATA_MAPPING:
		'com_liferay_dynamic_data_mapping_web_portlet_DDMPortlet',
	ITEM_SELECTOR: 'ITEM_SELECTOR',
};

/**
 * https://github.com/liferay/liferay-portal/blob/f8ea9617f99238f7f5b6e4824bf71ab2e64fdfdd/portal-web/docroot/html/common/themes/top_js.jspf#L168-L170
 */
const PropsValues = {
	JAVASCRIPT_SINGLE_PAGE_APPLICATION_TIMEOUT: 0,

	NTLM_AUTH_ENABLED: false,

	UPLOAD_SERVLET_REQUEST_IMPL_MAX_SIZE: 104857600,
};

/**
 * https://github.com/liferay/liferay-portal/blob/a4866af62eb89c69ee00d0e69dbe7ff092b50048/modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/global.es.js#L101-L104
 */
const Session = {

	/**
	 * https://github.com/liferay/liferay-portal/blob/a4866af62eb89c69ee00d0e69dbe7ff092b50048/modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/global.es.js#L102
	 */
	get: jest.fn(() => Promise.resolve({})),

	/**
	 * https://github.com/liferay/liferay-portal/blob/a4866af62eb89c69ee00d0e69dbe7ff092b50048/modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/global.es.js#L103
	 */
	set: jest.fn(() => Promise.resolve({})),
};

/**
 * Contains APIs that provide information about the running context of
 * the portal. The JS ThemeDisplay object is a representation of its
 * Java counterpart simplified for JS access.
 *
 * https://github.com/liferay/liferay-portal/blob/31073fb75fb0d3b309f9e0f921cb7a469aa2703d/portal-web/docroot/html/common/themes/top_js.jspf#L147
 */
const ThemeDisplay = {

	/**
	 * https://github.com/liferay/liferay-portal/blob/a4866af62eb89c69ee00d0e69dbe7ff092b50048/portal-web/docroot/html/common/themes/top_js.jspf#L188
	 */
	getBCP47LanguageId: jest.fn(() => 'en-US'),

	/**
	 * https://github.com/liferay/liferay-portal/blob/a4866af62eb89c69ee00d0e69dbe7ff092b50048/portal-web/docroot/html/common/themes/top_js.jspf#L214
	 */
	getDefaultLanguageId: jest.fn(() => 'en-US'),

	/**
	 * https://github.com/liferay/liferay-portal/blob/31073fb75fb0d3b309f9e0f921cb7a469aa2703d/portal-web/docroot/html/common/themes/top_js.jspf#L217
	 */
	getDoAsUserIdEncoded: jest.fn(() => 'default-mocked-do-as-user-id'),

	/**
	 * https://github.com/liferay/liferay-portal/blob/a4866af62eb89c69ee00d0e69dbe7ff092b50048/portal-web/docroot/html/common/themes/top_js.jspf#L220
	 */
	getLanguageId: jest.fn(() => 'en-US'),

	/**
	 * https://github.com/liferay/liferay-portal/blob/a4866af62eb89c69ee00d0e69dbe7ff092b50048/portal-web/docroot/html/common/themes/top_js.jspf#L226
	 */
	getPathContext: jest.fn(() => '/'),

	/**
	 * https://github.com/liferay/liferay-portal/blob/31073fb75fb0d3b309f9e0f921cb7a469aa2703d/portal-web/docroot/html/common/themes/top_js.jspf#L235
	 */
	getPathMain: jest.fn(() => '/c'),

	/**
	 * https://github.com/liferay/liferay-portal/blob/31073fb75fb0d3b309f9e0f921cb7a469aa2703d/portal-web/docroot/html/common/themes/top_js.jspf#L238
	 */
	getPathThemeImages: jest.fn(() => ''),

	/**
	 * https://github.com/liferay/liferay-portal/blob/31073fb75fb0d3b309f9e0f921cb7a469aa2703d/portal-web/docroot/html/common/themes/top_js.jspf#L247
	 */
	getPortalURL: jest.fn(() => 'http://localhost:8080'),

	/**
	 * https://github.com/liferay/liferay-portal/blob/f5bc2504a4f666241363a30975b6de5d57a6f627/portal-web/docroot/html/common/themes/top_js.jspf#L282
	 */
	getScopeGroupId: jest.fn(() => '2012'),
};

/**
 * General utilities on the `Liferay` object. Possible API sources are:
 *
 * - https://github.com/liferay/liferay-portal/blob/31073fb75fb0d3b309f9e0f921cb7a469aa2703d/modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/global.es.js
 * - https://github.com/liferay/liferay-portal/blob/31073fb75fb0d3b309f9e0f921cb7a469aa2703d/modules/apps/frontend-js/frontend-js-aui-web/src/main/resources/META-INF/resources/liferay/util.js
 */
const Util = {

	/**
	 * https://github.com/lodash/lodash/blob/2da024c3b4f9947a48517639de7560457cd4ec6c/escape.js#L41
	 * https://github.com/liferay/liferay-portal/blob/5f33f077a3f08ca5c2e9872d6f9d42c234e47a37/modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/global.es.js#L164
	 */
	escape: jest.fn((str) => str),

	/**
	 * https://github.com/liferay/liferay-portal/blob/5f33f077a3f08ca5c2e9872d6f9d42c234e47a37/modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/util/html_util.js#L39
	 */
	escapeHTML: jest.fn((str) => str),

	/**
	 * https://github.com/liferay/liferay-portal/blob/31073fb75fb0d3b309f9e0f921cb7a469aa2703d/modules/apps/frontend-js/frontend-js-aui-web/src/main/resources/META-INF/resources/liferay/util.js#L442
	 */
	getGeolocation: jest.fn(),

	/**
	 * https://github.com/liferay/liferay-portal/blob/a4866af62eb89c69ee00d0e69dbe7ff092b50048/modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/global.es.js#L75
	 */
	isEqual: jest.fn((a, b) => a === b),

	/**
	 * https://github.com/liferay/liferay-portal/blob/31073fb75fb0d3b309f9e0f921cb7a469aa2703d/modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/util/navigate.es.js
	 */
	navigate: jest.fn(),

	/**
	 * https://github.com/liferay/liferay-portal/blob/31073fb75fb0d3b309f9e0f921cb7a469aa2703d/modules/apps/frontend-js/frontend-js-web/test/liferay/util/ns.es.js
	 */
	ns: jest.fn(() => ({})),

	/**
	 * https://github.com/liferay/liferay-portal/blob/31073fb75fb0d3b309f9e0f921cb7a469aa2703d/modules/apps/frontend-js/frontend-js-aui-web/src/main/resources/META-INF/resources/liferay/util.js#L999
	 */
	sub: jest.fn(),

	/**
	 * https://github.com/liferay/liferay-portal/blob/5f33f077a3f08ca5c2e9872d6f9d42c234e47a37/modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/util/html_util.js#L46
	 */
	unescapeHTML: jest.fn((str) => str),
};

module.exports = {
	...events,
	Language,
	PortletKeys,
	PropsValues,
	Session,
	ThemeDisplay,
	Util,
	authToken,
	component,
	destroyComponent,
};
