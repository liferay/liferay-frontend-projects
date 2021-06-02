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

export {default as PkgDesc} from './bundler/PkgDesc';

// Project descriptor class and types

export {default as Adapt} from './project/Adapt';
export * from './project/Adapt';
export {default as Jar} from './project/Jar';
export * from './project/Jar';
export {default as Localization} from './project/Localization';
export * from './project/Localization';
export {default as Misc} from './project/Misc';
export * from './project/Misc';
export {default as Probe} from './project/Probe';
export * from './project/Probe';
export {default as Project} from './project/Project';
export * from './project/Project';
export {default as VersionInfo} from './project/VersionInfo';
export * from './project/VersionInfo';

// Format library

export * as format from './format';

// Miscellaneous utilities

export {negate as negateGlobs, prefix as prefixGlobs} from './globs';
export {default as escapeStringRegExp} from './escapeStringRegExp';
export {runNodeModulesBin, runPkgJsonScript} from './run';

// JSON file structure definitions (schemas)

export type {
	default as ConfigurationJson,
	ConfigurationJsonPortletInstance,
	ConfigurationJsonSystem,
	ConfigurationJsonField,
} from './schema/ConfigurationJson';
export type {
	default as ManifestJson,
	ManifestJsonPackages,
	ManifestJsonPackage,
	ManifestJsonPackageDescriptor,
	ManifestJsonModules,
	ManifestJsonModule,
	ManifestJsonModuleFlags,
} from './schema/ManifestJson';
export type {default as PkgJson} from './schema/PkgJson';

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
export {default as addConfigurationField} from './transform/json/operation/addConfigurationField';
export {default as addPkgJsonDependencies} from './transform/json/operation/addPkgJsonDependencies';
export {default as addPkgJsonScripts} from './transform/json/operation/addPkgJsonScripts';
export {default as addPortletProperties} from './transform/json/operation/addPortletProperties';
export {default as deletePkgJsonDependencies} from './transform/json/operation/deletePkgJsonDependencies';
export {default as setPkgJsonPortletHeader} from './transform/json/operation/setPkgJsonPortletHeader';

// Text source transformation

export * from './transform/text';
export {default as appendLines} from './transform/text/operation/appendLines';

// Template rendering

export {default as TemplateRenderer} from './template/Renderer';
