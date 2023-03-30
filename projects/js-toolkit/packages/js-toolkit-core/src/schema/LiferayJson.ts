/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

export default interface LiferayJson {
	build?: AnyTypedBuildConfig;
	deploy?: {
		path?: string;
	};
	start?: {
		port?: number;
	};
}

export type AnyTypedBuildConfig =
	| TypedBundler2BuildConfig
	| TypedCustomElementBuildConfig
	| TypedFDSCellRendererBuildConfig
	| TypedThemeSpritemapBuildConfig;

export interface TypedBuildConfig {
	options: unknown;
	type: string;
}

interface TypedBundler2BuildConfig extends TypedBuildConfig {
	options: Bundler2BuildConfig;
	type: 'bundler2';
}

export type Bundler2BuildConfig = {};

interface TypedCustomElementBuildConfig extends TypedBuildConfig {
	options: CustomElementBuildConfig;
	type: 'customElement';
}

export interface CustomElementBuildConfig {
	externals?: {[bareIdentifier: string]: string} | string[];
	htmlElementName?: string;
	portletCategoryName?: string;
}

interface TypedFDSCellRendererBuildConfig extends TypedBuildConfig {
	options: FDSCellRendererBuildConfig;
	type: 'fdsCellRenderer';
}

export interface FDSCellRendererBuildConfig {
	externals?: {[bareIdentifier: string]: string} | string[];
}

interface TypedThemeSpritemapBuildConfig extends TypedBuildConfig {
	options: ThemeSpritemapBuildConfig;
	type: 'themeSpritemap';
}

export interface ThemeSpritemapBuildConfig {
	enableSVG4Everybody?: boolean;
	extendClay?: boolean;
}
