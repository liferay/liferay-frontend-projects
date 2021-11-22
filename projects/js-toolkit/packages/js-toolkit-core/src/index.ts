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

// Template rendering

export {default as TemplateRenderer} from './template/Renderer';

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

export type {default as LiferayJson} from './schema/LiferayJson';

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
		setScripts: addOrSetPkgJsonScripts,
	},
	Text: {
		appendLines,
		removeLines,
	},
};
