# Layout (page) rendering in DXP

This document explains how a request to render a page is serviced in DXP.

## What gets requested when asking for http://localhost:8080?

First, we are going to list what external and internal requests are fired whenever someone hits DXP's root page.

> Note that, in addition to the requests a browser can make to our server, the server can dispatch internal requests to resources which undergo the standard request lifecycle, simulating an external request without any need to hit the HTTP transport layer at all. Usually the responses of these internal requests are included in the originating (external) request.

> All this is done leveraging the [`RequestDispatcher` API](https://docs.oracle.com/javaee/7/api/javax/servlet/RequestDispatcher.html) that can be retrieved from any [`ServletRequest`](https://javaee.github.io/javaee-spec/javadocs/javax/servlet/ServletRequest.html#getRequestDispatcher-java.lang.String-). You can see an example of how it is used in [`MainServlet.java`](https://github.com/liferay/liferay-portal/blob/2448ae35c6a8232af153acb0f366eafad59f48c4/portal-impl/src/com/liferay/portal/internal/servlet/MainServlet.java#L1119).

So, whenever someone hits http://localhost:8080, the following requests are serviced by Tomcat:

1. `/`: the originating external request
2. `/web/guest`: internal request to which `/` is forwarded. Note that you can also request `/web/guest` from the browser and you get the same content.
3. `/c/portal/layout?p_l_id=19&p_v_l_s_g_id=0`: this is internal too. The server maps the `/web/guest` request (which is a virtual path) to the configured layout, identified by a `p_l_id`. This is the request that truly generates the HTML content the user sees.
4. `/o/js_loader_config?t=1600876854212`: this is a external request triggered by the HTML once the browser loads it. It returns the configuration of the AMD loader.
5. `/o/classic-theme/js/main.js?browserId=firefox&minifierType=js&languageId=en_US&b=7305&t=1600791970000`: external request downloading the theme's JavaScript code.
6. `/combo?browserId=firefox&minifierType=js&languageId=en_US&b=7305&t=1600873127973&/o/frontend-js-aui-web/aui/aui/aui.js&...&/o/frontend-js-web/liferay/workflow.js`: external request downloading DXP's core JavaScript code.
7. `/o/js_bundle_config?t=1600876893358`: external request downloading the configuration of the legacy AUI loader.
8. `/o/js_resolve_modules?...`: a request to resolve AMD modules. Several more of this follow as well as requests to the `combo` servlet to download the resolved modules.
9. `/image/company_logo`: request for web site logo.
10. `/o/classic-theme/images/clay/icons.svg`: request for Clay icon library.
11. `/c/portal/login?p_l_id=19&windowState=exclusive`: internal request for the login portlet.
12. `/web/guest/home-widget-?p_p_id=com_liferay_login_web_portlet_LoginPortlet&p_p_lifecycle=0&p_p_state=exclusive&p_p_mode=view&saveLastPath=false&_com_liferay_login_web_portlet_LoginPortlet_mvcRenderCommandName=%2Flogin%2Flogin`: the real path servicing the login's portlet response.

In this document we are mainly interested in the first 3 which are the responsibles for rendering the HTML code you see in the browser. Specifically the third one, as the other two are simply forwards.

# How layout requests are processed

There are several pieces involved in rendering a layout. We will see the details of each one in the following sections.

## `MainServlet`

Processes any request to `/c/...` URLs. It reads the `/WEB-INF/struts-config.xml` file to configure itself with `Action`s, `ActionForward`s, ...

## `PortalRequestProcessor`

Processes the following paths (see the [code]()):

```java
	_publicPaths.add(_PATH_C);
	_publicPaths.add(_PATH_PORTAL_API_JSONWS);
	_publicPaths.add(_PATH_PORTAL_FLASH);
	_publicPaths.add(_PATH_PORTAL_J_LOGIN);
	_publicPaths.add(_PATH_PORTAL_LAYOUT);
	_publicPaths.add(_PATH_PORTAL_LICENSE);
	_publicPaths.add(_PATH_PORTAL_LOGIN);
	_publicPaths.add(_PATH_PORTAL_RENDER_PORTLET);
	_publicPaths.add(_PATH_PORTAL_TCK);
	_publicPaths.add(_PATH_PORTAL_UPDATE_LANGUAGE);
	_publicPaths.add(_PATH_PORTAL_UPDATE_PASSWORD);
	_publicPaths.add(_PATH_PORTAL_VERIFY_EMAIL_ADDRESS);
	_publicPaths.add(PropsValues.AUTH_LOGIN_DISABLED_PATH);
```

`MainServlet` delegates to `PortalRequestProcessor.process()` the handling of every `GET` and `POST` request.

In addition it may redirect to the _Setup Wizard_ or the default _Error Page_.

It contains a map named `_definitions` which is loaded from the servlet context invoking:

```java
	servletContext.getAttribute(TilesUtil.DEFINITIONS)
```

and maps Struts' logical forwards (for example: `portal.layout`) to paths inside DXP (for example: `/common/themes/portal.jsp`).

## `Action`

It is an implementation that lives inside `portal-impl` and emulates the old `StrutsAction`. It was created to remove Struts from DXP while still retaining the old structure of Java classes and prevent migrating them to portlets, servlets, or anything similar.

Currently we have the following `Action`s in `portal-impl`:

-   `portal-impl/src/com/liferay/portal/struts/model/ActionMapping.java`
-   `portal-impl/src/com/liferay/portal/struts/model/ModuleConfig.java`
-   `portal-impl/src/com/liferay/portal/action/VerifyEmailAddressAction.java`
-   `portal-impl/src/com/liferay/portal/action/UpdateTermsOfUseAction.java`
-   `portal-impl/src/com/liferay/portal/action/LoginAction.java`
-   `portal-impl/src/com/liferay/portal/action/RESTProxyAction.java`
-   `portal-impl/src/com/liferay/portal/action/UpdatePasswordAction.java`
-   `portal-impl/src/com/liferay/portal/action/UpdateLayoutAction.java`
-   `portal-impl/src/com/liferay/portal/action/UpdateLicenseAction.java`
-   `portal-impl/src/com/liferay/portal/action/SetupWizardAction.java`
-   `portal-impl/src/com/liferay/portal/action/SitemapAction.java`
-   `portal-impl/src/com/liferay/portal/action/SessionClickAction.java`
-   `portal-impl/src/com/liferay/portal/action/UpdateReminderQueryAction.java`
-   `portal-impl/src/com/liferay/portal/action/RenderPortletAction.java`
-   `portal-impl/src/com/liferay/portal/action/UpdateLanguageAction.java`
-   `portal-impl/src/com/liferay/portal/action/LogoutAction.java`
-   `portal-impl/src/com/liferay/portal/action/TestAction.java`
-   `portal-impl/src/com/liferay/portal/action/TestRedirectAction.java`
-   `portal-impl/src/com/liferay/portal/action/SessionTreeJSClickAction.java`
-   `portal-impl/src/com/liferay/portal/action/RobotsAction.java`
-   `portal-impl/src/com/liferay/portal/action/UpdateEmailAddressAction.java`
-   `portal-impl/src/com/liferay/portal/action/LayoutAction.java`

Note that, because this is legacy code, we should expect no more `Action`s to appear in DXP's codebase.

## `StrutsAction`

This is another interface to emulate the old support for `StrutsAction`s. However, as opposed to `Action` which is inside `portal-impl`, this one lives in `portal-kernel` as it is intended to support OSGi modules, not DXP's core.

These are the existing `StrutAction`s:

-   `modules/dxp/apps/oauth/oauth-web/src/main/java/com/liferay/oauth/web/internal/struts/OAuthRequestTokenStrutsAction.java`
-   `modules/dxp/apps/oauth/oauth-web/src/main/java/com/liferay/oauth/web/internal/struts/OAuthAccessTokenStrutsAction.java`
-   `modules/dxp/apps/oauth/oauth-web/src/main/java/com/liferay/oauth/web/internal/struts/OAuthAuthorizeStrutsAction.java`
-   `modules/dxp/apps/sharepoint-rest/sharepoint-rest-repository/src/main/java/com/liferay/sharepoint/rest/repository/internal/struts/SharepointOAuth2StrutsAction.java`
-   `modules/dxp/apps/saml/saml-addon-keep-alive-web/src/main/java/com/liferay/saml/addon/keep/alive/web/internal/struts/KeepAliveStrutsAction.java`
-   `modules/dxp/apps/saml/saml-web/src/main/java/com/liferay/saml/web/internal/struts/BaseSamlStrutsAction.java`
-   `modules/apps/knowledge-base/knowledge-base-web/src/main/java/com/liferay/knowledge/base/web/internal/struts/FindKBArticleStrutsAction.java`
-   `modules/apps/captcha/captcha-taglib/src/main/java/com/liferay/captcha/taglib/internal/struts/GetCaptchaImageStrutsAction.java`
-   `modules/apps/blogs/blogs-web/src/main/java/com/liferay/blogs/web/internal/struts/RSSStrutsAction.java`
-   `modules/apps/login/login-authentication-facebook-connect-web/src/main/java/com/liferay/login/authentication/facebook/connect/web/internal/struts/FacebookConnectStrutsAction.java`
-   `modules/apps/message-boards/message-boards-web/src/main/java/com/liferay/message/boards/web/internal/struts/FindRecentPostsStrutsAction.java`
-   `modules/apps/message-boards/message-boards-web/src/main/java/com/liferay/message/boards/web/internal/struts/RSSStrutsAction.java`
-   `modules/apps/document-library/document-library-web/src/main/java/com/liferay/document/library/web/internal/struts/GetFileStrutsAction.java`
-   `modules/apps/comment/comment-taglib/src/main/java/com/liferay/comment/taglib/internal/struts/GetEditorStrutsAction.java`
-   `modules/apps/comment/comment-taglib/src/main/java/com/liferay/comment/taglib/internal/struts/GetCommentsStrutsAction.java`
-   `modules/apps/comment/comment-taglib/src/main/java/com/liferay/comment/taglib/internal/struts/EditDiscussionStrutsAction.java`
-   `modules/apps/fragment/fragment-web/src/main/java/com/liferay/fragment/web/internal/struts/RenderFragmentEntryStrutsAction.java`
-   `modules/apps/fragment/fragment-web/src/main/java/com/liferay/fragment/web/internal/struts/ImportFragmentEntriesStrutsAction.java`
-   `modules/apps/portal-security-sso-google/portal-security-sso-google-login-authentication-web/src/main/java/com/liferay/portal/security/sso/google/login/authentication/web/internal/struts/GoogleLoginStrutsAction.java`
-   `modules/apps/subscription/subscription-web/src/main/java/com/liferay/subscription/web/internal/struts/UnsubscribeStrutsAction.java`
-   `modules/apps/wiki/wiki-web/src/main/java/com/liferay/wiki/web/internal/struts/RSSStrutsAction.java`
-   `modules/apps/wiki/wiki-web/src/main/java/com/liferay/wiki/web/internal/struts/GetPageAttachmentStrutsAction.java`
-   `modules/apps/bookmarks/bookmarks-web/src/main/java/com/liferay/bookmarks/web/internal/struts/FindEntryStrutsAction.java`
-   `modules/apps/bookmarks/bookmarks-web/src/main/java/com/liferay/bookmarks/web/internal/struts/OpenEntryStrutsAction.java`
-   `modules/apps/archived/portal-security-wedeploy-auth-web/src/main/java/com/liferay/portal/security/wedeploy/auth/web/internal/struts/WeDeployUserInfoStrutsAction.java`
-   `modules/apps/archived/portal-security-wedeploy-auth-web/src/main/java/com/liferay/portal/security/wedeploy/auth/web/internal/struts/WeDeployAccessTokenStrutsAction.java`
-   `modules/apps/archived/portal-security-wedeploy-auth-web/src/main/java/com/liferay/portal/security/wedeploy/auth/web/internal/struts/WeDeployAuthorizeStrutsAction.java`
-   `modules/apps/layout/layout-page-template-admin-web/src/main/java/com/liferay/layout/page/template/admin/web/internal/struts/ExportLayoutPageTemplateEntriesStrutsAction.java`

As with `portal-impl`'s `Action`s, we should expect no more `StrutsAction`s to appear in DXP's codebase.

## `LayoutAction`

This is the specific `Action` responsible for processing all requests to `/c/portal/layout`.

## `TilesUtil`

This is the support for the legacy Struts Tiles. It has a `loadDefinitions()` method which is invoked by `MainServlet`, upon initialization, to load `TilesUtil.DEFINITIONS` to be used by `PortalRequestProcessor` to map Struts forwards usings the `_definitions` map.

The Tiles defininitions are loaded from the `/WEB-INF/tiles-defs.xml` file.

## `portal.jsp`

This is a JSP file that checks the value of the `pop_up` attribute in the active Tiles definition and then invokes `portal_pop_up.jsp` or `portal_normal.jsp` depending on its value. This way, the content being rendered is drawn as a popup dialog or a regular HTML page.

It can also call `portal_pop_up.jsp` if the current request contains a `WIDGET` attribute set to `true`. This happens when the `WidgetServlet` services any URL starting with `/widget/...`.

## `WidgetServlet`

This servlet listens to `/widget/...` URLs and reforwards whatever comes after `/widget/` to be processed again but before it sets a `WIDGET` attribute to `true` in the request, so that the content is rendered using the `portal_pop_up.jsp` template instead of the `portal_normal.jsp` one.

> Note, however, that not every URL can be routed through `/widget/...` and expect it to be shown correctly inside a popup.

> This was used in the past by the `Liferay.Widget` API, but it is now deprecated and not used in DXP.

## `ThemeImpl`, `portal_pop_up.jsp` and `portal_normal.jsp`

Inside `portal-web/docroot/html/common/themes` there used to be two core JSP files to render content. However, with the advent of themes, these two files were diverted to templates inside the active theme. So, for example, in a vanilla DXP installation they get routed to:

-   `portal_pop_up.jsp`: `portal_pop_up.ftl`
-   `portal_normal.jsp`: `portal_normal.ftl`

Both FTL files inside `classic-theme` or `admin-theme` (whichever one is active for the request).

This mapping happens in [`ThemeImpl.getResourcePath()`](https://github.com/liferay/liferay-portal/blob/02716cc55e569eb315783aafb678d73fd90ad971/portal-impl/src/com/liferay/portal/model/impl/ThemeImpl.java#L688).

# How all this fits together
