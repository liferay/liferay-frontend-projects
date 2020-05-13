/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

// Operations on files
export {default as FilePath} from './file/FilePath';
export {default as Manifest} from './file/handler/Manifest';

// Utilities to deal with node packages and modules
export * from './node/modules';
export * from './node/namespace';

// TODO: remove the next section before babel 3 release
// Bundler plugin utilities
export * from './bundler/PkgDesc';
export * from './bundler/PluginLogger';
export type {
	BundlerLoaderMetadata,
	BundlerLoaderEntryPoint,
	BundlerLoaderContext,
	BundlerLoaderReturn,
} from './bundler/loader';

// Project descriptor class and types
export * from './project/Adapt';
export * from './project/Jar';
export * from './project/Localization';
export * from './project/Misc';
export * from './project/Probe';
export * from './project/Project';
export * from './project/Rules';
export * from './project/VersionInfo';

// Format library
export * as format from './format';

// Miscellaneous utilities
export {negate as negateGlobs, prefix as prefixGlobs} from './globs';
export {default as escapeStringRegexp} from './escapeStringRegexp';

// JSON file structure definitions (schemas)
export type {
	ConfigurationJson,
	ConfigurationJsonPortletInstance,
	ConfigurationJsonSystem,
	ConfigurationJsonField,
} from './schema/ConfigurationJson';
export type {
	ManifestJson,
	ManifestJsonPackages,
	ManifestJsonPackage,
	ManifestJsonPackageDescriptor,
	ManifestJsonModules,
	ManifestJsonModule,
	ManifestJsonModuleFlags,
} from './schema/ManifestJson';
export type {PkgJson} from './schema/PkgJson';

// JavaScript AST helpers
export {getProgramStatements as getAstProgramStatements} from './transform/js/ast';
export {
	parse as parseAsAstProgram,
	parseAsExpressionStatement as parseAsAstExpressionStatement,
} from './transform/js/parse';

// JavaScript source transformation
export {
	SourceCode as JsSource,
	SourceTransform as JsSourceTransform,
	replace as replaceJsSource,
	transformSource as transformJsSource,
	transformSourceFile as transformJsSourceFile,
} from './transform/js';
export {default as replaceInStringLiterals} from './transform/js/operation/replaceInStringLiterals';
export {default as wrapModule} from './transform/js/operation/wrapModule';

// JSON source transformation
export * from './transform/json';
export {default as setPortletHeader} from './transform/json/operation/setPortletHeader';

// Text source transformation
export * from './transform/text';
