/**
 * SPDX-FileCopyrightText: © 2023 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import type {
	Bundler2BuildConfig,
	CustomElementBuildConfig,
} from './LiferayJson';

export default interface ClientExtensionYaml
	extends Bundler2BuildConfig,
		CustomElementBuildConfig {
	baseURL: string;
	description: string;
	name: string;
	sourceCodeURL: string;
	type: 'bundler2' | 'customElement';
}
