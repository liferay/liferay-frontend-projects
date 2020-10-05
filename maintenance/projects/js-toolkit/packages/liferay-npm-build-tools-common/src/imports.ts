/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/** Structure of `config.imports` section of `.npmbundlerrc` */
export interface ImportsConfig {
	/** Version constraints for provider packages theirselves */
	''?: PackageConstraints;

	/** Version constraints for packages provided by provider packages */
	[index: string]: PackageConstraints | ProviderImports;
}

/** Version constraints indexed by package name */
export interface PackageConstraints {
	/** Version constraints for a package name */
	[index: string]: string;
}

/**
 * Version constraints indexed by package name (may include the provider package
 * itself)
 */
export interface ProviderImports extends PackageConstraints {
	/** Version constraints for the provider package itself */
	'/'?: string;
}

/**
 * Another format form {@link ImportsConfig} unrolled for easy indexing of
 * imported packages.
 */
export interface UnrolledImportsConfig {
	/** Import configuration for a given imported package name */
	[index: string]: UnrolledImport;
}

/** Import configuration for an imported package */
export interface UnrolledImport {
	/** Provider package name */
	name: string;

	/** Provider package version constraints */
	version: string;
}

/**
 * Normalize an imports configuration to canonicalize all syntactic sugar.
 * @param importsConfig the configuration in its original format
 * @param useSlashFormat whether to use slash or empty string format for
 * 			provider packages version constraints
 * @return the normalized configuration after resolving all syntactic sugar
 */
export function normalizeImportsConfig(
	importsConfig: ImportsConfig,
	useSlashFormat: boolean = false
): ImportsConfig {
	const normalized: ImportsConfig = {};

	// Normalize to empty-string format
	Object.keys(importsConfig).forEach(namespace => {
		Object.keys(importsConfig[namespace]).forEach(pkgName => {
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
		Object.keys(normalized).forEach(namespace => {
			Object.keys(normalized[namespace]).forEach(pkgName => {
				if (namespace === '') {
					normalized[pkgName] = normalized[pkgName] || {};
					normalized[pkgName]['/'] = normalized[namespace][pkgName];

					delete normalized[namespace][pkgName];

					if (Object.keys(normalized[namespace]).length == 0) {
						delete normalized[namespace];
					}
				}
			});
		});
	}

	return normalized;
}

/**
 * Unrolls the imports configuration section of .npmbundlerrc file.
 * @param importsConfig the configuration in its original format
 * @return the unrolled configuration with one entry per module name
 */
export function unrollImportsConfig(
	importsConfig: ImportsConfig
): UnrolledImportsConfig {
	importsConfig = normalizeImportsConfig(importsConfig || {});

	const imports: UnrolledImportsConfig = {};

	Object.keys(importsConfig).forEach(namespace => {
		Object.keys(importsConfig[namespace]).forEach(pkgName => {
			if (imports[pkgName]) {
				throw new Error(
					`Package ${pkgName} is mapped to more than one import`
				);
			}

			imports[pkgName] = {
				name: namespace,
				version: importsConfig[namespace][pkgName],
			};
		});
	});

	return imports;
}
