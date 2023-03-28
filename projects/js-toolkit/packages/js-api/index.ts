/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import LiferayImpl from './internal/LiferayImpl';

export interface Liferay {
	themeDisplay: ThemeDisplay;
}

export interface ThemeDisplay {
	getBCP47LanguageId(): string;
	getCDNBaseURL(): string;
	getCDNDynamicResourcesHost(): string;
	getCDNHost(): string;
	getCanonicalURL(): string;
	getCompanyGroupId(): string;
	getCompanyId(): string;
	getDefaultLanguageId(): string;
	getDoAsUserIdEncoded(): string;
	getLanguageId(): string;
	getLayoutId(): string;
	getLayoutRelativeControlPanelURL(): string;
	getLayoutRelativeURL(): string;
	getLayoutURL(): string;
	getParentGroupId(): string;
	getParentLayoutId(): string;
	getPathContext(): string;
	getPathImage(): string;
	getPathJavaScript(): string;
	getPathMain(): string;
	getPathThemeImages(): string;
	getPathThemeRoot(): string;
	getPlid(): string;
	getPortalURL(): string;
	getRealUserId(): string;
	getRemoteAddr(): string;
	getRemoteHost(): string;
	getScopeGroupId(): string;
	getScopeGroupIdOrLiveGroupId(): string;
	getSessionId(): string;
	getSiteAdminURL(): string;
	getSiteGroupId(): string;
	getURLControlPanel(): string;
	getURLHome(): string;
	getUserEmailAddress(): string;
	getUserId(): string;
	getUserName(): string;
	isAddSessionIdToURL(): boolean;
	isControlPanel(): boolean;
	isImpersonated(): boolean;
	isPrivateLayout(): boolean;
	isSignedIn(): boolean;
	isStagedPortlet(): boolean;
	isStateExclusive(): boolean;
	isStateMaximized(): boolean;
	isStatePopUp(): boolean;
	isVirtualLayout(): boolean;
}

export const liferay: Liferay = new LiferayImpl();
