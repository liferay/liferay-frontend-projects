/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

// File paths handling
export {default as FilePath} from './file-path';

// Handler for manifest.json files
export {default as Manifest} from './manifest';

// TODO: maybe remove the next section before bundler 3?
// Utilities to deal with npm packages' information structures
export * from './alias';
export {normalizeImportsConfig, unrollImportsConfig} from './imports'; // TODO: remove imports for sure
export * from './modules';
export * from './namespace';
export * from './packages';

// TODO: remove the next section before babel 3 release
// Bundler plugin utilities
export * from './api/loaders';
export * from './api/plugins';
export * as babelIpc from './babel-ipc';
export * from './babel-util'; // TODO: not sure if this is needed in bundler 3
export {default as PkgDesc} from './pkg-desc';
export {default as PluginLogger} from './plugin-logger';

// Project descriptor class and types
export * from './project';

// Format library
export * as format from './format';

// Miscellaneous utilities
export {negate as negateGlobs, prefix as prefixGlobs} from './globs';
export * from './regexp';

// JSON file structure definitions (schemas)
export * from './api/configuration-json';
export * from './api/manifest';
export {PkgJson} from './project'; // TODO: move to its own file

// JavaScript AST helpers
export {
	getProgramStatements as getAstProgramStatements,
} from './transform/js/ast';
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
export {
	default as replaceInStringLiterals,
} from './transform/js/operation/replaceInStringLiterals';
export {default as wrapModule} from './transform/js/operation/wrapModule';

// JSON source transformation
export * from './transform/json';
export {
	default as setPortletHeader,
} from './transform/json/operation/setPortletHeader';

// Text source transformation
export * from './transform/text';
