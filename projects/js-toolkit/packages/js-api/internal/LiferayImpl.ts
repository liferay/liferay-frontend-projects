/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

export default class LiferayImpl {
	public readonly themeDisplay = new ThemeDisplayImpl();
}

class ThemeDisplayImpl {
	getBCP47LanguageId(): string {
		return Liferay.ThemeDisplay.getBCP47LanguageId();
	}

	getCDNBaseURL(): string {
		return Liferay.ThemeDisplay.getCDNBaseURL();
	}

	getCDNDynamicResourcesHost(): string {
		return Liferay.ThemeDisplay.getCDNDynamicResourcesHost();
	}

	getCDNHost(): string {
		return Liferay.ThemeDisplay.getCDNHost();
	}

	getCanonicalURL(): string {
		return Liferay.ThemeDisplay.getCanonicalURL();
	}

	getCompanyGroupId(): string {
		return Liferay.ThemeDisplay.getCompanyGroupId();
	}

	getCompanyId(): string {
		return Liferay.ThemeDisplay.getCompanyId();
	}

	getDefaultLanguageId(): string {
		return Liferay.ThemeDisplay.getDefaultLanguageId();
	}

	getDoAsUserIdEncoded(): string {
		return Liferay.ThemeDisplay.getDoAsUserIdEncoded();
	}

	getLanguageId(): string {
		return Liferay.ThemeDisplay.getLanguageId();
	}

	getLayoutId(): string {
		return Liferay.ThemeDisplay.getLayoutId();
	}

	getLayoutRelativeControlPanelURL(): string {
		return Liferay.ThemeDisplay.getLayoutRelativeControlPanelURL();
	}

	getLayoutRelativeURL(): string {
		return Liferay.ThemeDisplay.getLayoutRelativeURL();
	}

	getLayoutURL(): string {
		return Liferay.ThemeDisplay.getLayoutURL();
	}

	getParentGroupId(): string {
		return Liferay.ThemeDisplay.getParentGroupId();
	}

	getParentLayoutId(): string {
		return Liferay.ThemeDisplay.getParentLayoutId();
	}

	getPathContext(): string {
		return Liferay.ThemeDisplay.getPathContext();
	}

	getPathImage(): string {
		return Liferay.ThemeDisplay.getPathImage();
	}

	getPathJavaScript(): string {
		return Liferay.ThemeDisplay.getPathJavaScript();
	}

	getPathMain(): string {
		return Liferay.ThemeDisplay.getPathMain();
	}

	getPathThemeImages(): string {
		return Liferay.ThemeDisplay.getPathThemeImages();
	}

	getPathThemeRoot(): string {
		return Liferay.ThemeDisplay.getPathThemeRoot();
	}

	getPlid(): string {
		return Liferay.ThemeDisplay.getPlid();
	}

	getPortalURL(): string {
		return Liferay.ThemeDisplay.getPortalURL();
	}

	getRealUserId(): string {
		return Liferay.ThemeDisplay.getRealUserId();
	}

	getRemoteAddr(): string {
		return Liferay.ThemeDisplay.getRemoteAddr();
	}

	getRemoteHost(): string {
		return Liferay.ThemeDisplay.getRemoteHost();
	}

	getScopeGroupId(): string {
		return Liferay.ThemeDisplay.getScopeGroupId();
	}

	getScopeGroupIdOrLiveGroupId(): string {
		return Liferay.ThemeDisplay.getScopeGroupIdOrLiveGroupId();
	}

	getSessionId(): string {
		return Liferay.ThemeDisplay.getSessionId();
	}

	getSiteAdminURL(): string {
		return Liferay.ThemeDisplay.getSiteAdminURL();
	}

	getSiteGroupId(): string {
		return Liferay.ThemeDisplay.getSiteGroupId();
	}

	getURLControlPanel(): string {
		return Liferay.ThemeDisplay.getURLControlPanel();
	}

	getURLHome(): string {
		return Liferay.ThemeDisplay.getURLHome();
	}

	getUserEmailAddress(): string {
		return Liferay.ThemeDisplay.getUserEmailAddress();
	}

	getUserId(): string {
		return Liferay.ThemeDisplay.getUserId();
	}

	getUserName(): string {
		return Liferay.ThemeDisplay.getUserName();
	}

	isAddSessionIdToURL(): boolean {
		return Liferay.ThemeDisplay.isAddSessionIdToURL();
	}

	isControlPanel(): boolean {
		return Liferay.ThemeDisplay.isControlPanel();
	}

	isImpersonated(): boolean {
		return Liferay.ThemeDisplay.isImpersonated();
	}

	isPrivateLayout(): boolean {
		return Liferay.ThemeDisplay.isPrivateLayout();
	}

	isSignedIn(): boolean {
		return Liferay.ThemeDisplay.isSignedIn();
	}

	isStagedPortlet(): boolean {
		return Liferay.ThemeDisplay.isStagedPortlet();
	}

	isStateExclusive(): boolean {
		return Liferay.ThemeDisplay.isStateExclusive();
	}

	isStateMaximized(): boolean {
		return Liferay.ThemeDisplay.isStateMaximized();
	}

	isStatePopUp(): boolean {
		return Liferay.ThemeDisplay.isStatePopUp();
	}

	isVirtualLayout(): boolean {
		return Liferay.ThemeDisplay.isVirtualLayout();
	}
}
