/**
 * SPDX-FileCopyrightText: © 2023 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import type {
	BuildType,
	Bundler2BuildConfig,
	CustomElementBuildConfig,
	ThemeSpritemapBuildConfig,
} from './LiferayJson';

export default interface ClientExtensionYaml
	extends Bundler2BuildConfig,
		CustomElementBuildConfig,
		ThemeSpritemapBuildConfig {
	baseURL: string;
	description: string;
	name: string;
	sourceCodeURL: string;
	type: BuildType;
}
