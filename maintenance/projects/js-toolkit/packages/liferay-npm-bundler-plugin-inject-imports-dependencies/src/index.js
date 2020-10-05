/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {normalizeImportsConfig} from 'liferay-npm-build-tools-common/lib/imports';
import * as ns from 'liferay-npm-build-tools-common/lib/namespace';

/**
 * @return {void}
 */
export default function({config, globalConfig, log, rootPkgJson}, {pkgJson}) {
	let imports = config.imports || globalConfig.imports || {};

	imports = normalizeImportsConfig(imports);

	pkgJson.dependencies = pkgJson.dependencies || {};

	Object.keys(imports).forEach(namespace => {
		Object.keys(imports[namespace]).forEach(pkgName => {
			const localName = ns.addNamespace(pkgName, rootPkgJson);

			const importVersion = imports[namespace][pkgName];
			const importName =
				namespace === ''
					? pkgName
					: ns.addNamespace(pkgName, {name: namespace});

			pkgJson.dependencies[importName] = importVersion;

			if (
				pkgJson.dependencies[localName] !== undefined &&
				pkgJson.dependencies[localName] !== importVersion
			) {
				log.info(
					'inject-imports-dependencies',
					'Injected dependency',
					`${importName}@${importVersion}`,
					'(however, note that the same dependency in package.json',
					'has different constraints:',
					`${localName}@${pkgJson.dependencies[localName]})`
				);
			} else {
				log.info(
					'inject-imports-dependencies',
					'Injected dependency',
					`${importName}@${importVersion}`
				);
			}
		});
	});
}
