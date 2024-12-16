/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

// TODO: remove the next section before babel 3 release
// Bundler plugin utilities

export {default as PkgDesc} from './bundler/PkgDesc';
export {default as escapeStringRegExp} from './escapeStringRegExp';

// Utilities to deal with node packages and modules

export * from './node/modules';
export * from './node/namespace';

// Operations on files

export {default as FilePath} from './file/FilePath';

export {default as Manifest} from './file/handler/Manifest';

// Miscellaneous utilities

export {negate as negateGlobs, prefix as prefixGlobs} from './globs';
export {LogLevel as B3LogLevel} from './project/bundler3/Misc';
export {ProjectType as B3ProjectType} from './project/bundler3/Probe';

// Bundler 3 Project descriptor class and types

export {
	default as B3Project,
	Imports as B3Imports,
} from './project/bundler3/Project';
export {default as B3VersionInfo} from './project/bundler3/VersionInfo';

// Format library

export * as format from './format';

export {
	Bundler2BuildOptions,
	CustomElementBuildOptions,
	MinifiableBuildOptions,
	WebpackBuildOptions,
} from './project/liferayCli/Build';

// Liferay CLI Project descriptor class and types

export {default as Project} from './project/liferayCli/Project';
export {runNodeModulesBin, runPkgJsonScript} from './run';

// JSON file structure definitions (schemas)

export type {
	default as ClientExtensionConfigJson,
	ClientExtensionConfigJsonType,
} from './schema/ClientExtensionConfigJson';

export type {
	default as ConfigurationJson,
	ConfigurationJsonPortletInstance,
	ConfigurationJsonSystem,
	ConfigurationJsonField,
} from './schema/ConfigurationJson';

export type {
	default as LiferayJson,
	AnyTypedBuildConfig,
	Bundler2BuildConfig,
	CustomElementBuildConfig,
	TypedBuildConfig,
} from './schema/LiferayJson';

export type {
	default as ManifestJson,
	ManifestJsonPackages,
	ManifestJsonPackage,
	ManifestJsonPackageDescriptor,
	ManifestJsonModules,
	ManifestJsonModule,
	ManifestJsonModuleFlags,
} from './schema/ManifestJson';

export type {
	default as PkgJson,
	PkgJsonDependencies,
	PkgJsonPortletProperties,
	PkgJsonScripts,
} from './schema/PkgJson';

export type {default as RemoteAppManifestJson} from './schema/RemoteAppManifestJson';

// Template rendering

export {default as TemplateRenderer} from './template/Renderer';

// JavaScript source code transformation

export type {
	SourceCode as JsSource,
	SourceTransform as JsSourceTransform,
} from './transform/js';
export {
	replace as replaceJsSource,
	transformSource as transformJsSource,
	transformSourceFile as transformJsSourceFile,
} from './transform/js';
export {getProgramStatements as getAstProgramStatements} from './transform/js/ast';
export {
	parse as parseAsAstProgram,
	parseAsExpressionStatement as parseAsAstExpressionStatement,
} from './transform/js/parse';

// JSON transformation

export type {JsonTransform} from './transform/json';
export {transformJson, transformJsonFile} from './transform/json';

// Text transformation

export type {TextTransform} from './transform/text';
export {transformText, transformTextFile} from './transform/text';

// Transformation operations per file type

/* eslint-disable @liferay/imports-first, @liferay/group-imports */
import replaceInStringLiterals from './transform/js/operation/replaceInStringLiterals';
import wrapModule from './transform/js/operation/wrapModule';

import addConfigurationJsonField from './transform/json/operation/addConfigurationJsonField';
import addOrSetPkgJsonScripts from './transform/json/operation/addOrSetPkgJsonScripts';
import addPkgJsonDependencies from './transform/json/operation/addPkgJsonDependencies';
import addPkgJsonPortletProperties from './transform/json/operation/addPkgJsonPortletProperties';
import deletePkgJsonDependencies from './transform/json/operation/deletePkgJsonDependencies';
import deletePkgJsonScripts from './transform/json/operation/deletePkgJsonScripts';
import setLiferayJsonDeployPath from './transform/json/operation/setLiferayJsonDeployPath';
import setPkgJsonMain from './transform/json/operation/setPkgJsonMain';

import appendLines from './transform/text/operation/appendLines';
import removeLines from './transform/text/operation/removeLines';
/* eslint-enable @liferay/imports-first, @liferay/group-imports */

export const TRANSFORM_OPERATIONS = {
	ConfigurationJson: {
		addField: addConfigurationJsonField,
	},
	JsSource: {
		replaceInStringLiterals,
		wrapModule,
	},
	LiferayJson: {
		setLiferayJsonDeployPath,
	},
	PkgJson: {
		addDependencies: addPkgJsonDependencies,
		addPortletProperties: addPkgJsonPortletProperties,
		addScripts: addOrSetPkgJsonScripts,
		deleteDependencies: deletePkgJsonDependencies,
		deleteScripts: deletePkgJsonScripts,
		setMain: setPkgJsonMain,
		setScripts: addOrSetPkgJsonScripts,
	},
	Text: {
		appendLines,
		removeLines,
	},
};
