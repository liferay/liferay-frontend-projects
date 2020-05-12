/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/** Structure of `config.imports` section of `.npmbundlerrc` */
interface ImportsConfig {
	/** Version constraints for provider packages theirselves */
	''?: PackageConstraints;

	/** Version constraints for packages provided by provider packages */
	[index: string]: PackageConstraints | ProviderImports;
}

/** Version constraints indexed by package name */
interface PackageConstraints {
	/** Version constraints for a package name */
	[index: string]: string;
}

/**
 * Version constraints indexed by package name (may include the provider package
 * itself)
 */
interface ProviderImports extends PackageConstraints {
	/** Version constraints for the provider package itself */
	'/'?: string;
}

/**
 * Normalize an imports configuration to canonicalize all syntactic sugar.
 * @param importsConfig the configuration in its original format
 * @param useSlashFormat whether to use slash or empty string format for
 * 			provider packages version constraints
 * @return the normalized configuration after resolving all syntactic sugar
 */
export default function normalizeImportsConfig(
	importsConfig: ImportsConfig,
	useSlashFormat = false
): ImportsConfig {
	const normalized: ImportsConfig = {};

	// Normalize to empty-string format
	Object.keys(importsConfig).forEach((namespace) => {
		Object.keys(importsConfig[namespace]).forEach((pkgName) => {
			const version = importsConfig[namespace][pkgName];
			let normalizedSpace = namespace;

			if (pkgName === '/') {
				pkgName = namespace;
				normalizedSpace = '';
			}

			normalized[normalizedSpace] = normalized[normalizedSpace] || {};
			normalized[normalizedSpace][pkgName] = version;
		});
	});

	// If necessary convert back to slash format
	if (useSlashFormat) {
		Object.keys(normalized).forEach((namespace) => {
			Object.keys(normalized[namespace]).forEach((pkgName) => {
				if (namespace === '') {
					normalized[pkgName] = normalized[pkgName] || {};
					normalized[pkgName]['/'] = normalized[namespace][pkgName];

					delete normalized[namespace][pkgName];

					if (Object.keys(normalized[namespace]).length === 0) {
						delete normalized[namespace];
					}
				}
			});
		});
	}

	return normalized;
}
