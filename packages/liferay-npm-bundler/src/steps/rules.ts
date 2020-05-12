/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import {
	BundlerLoaderContext,
	BundlerLoaderDescriptor,
	PkgDesc,
	PluginLogger,
	prefixGlobs,
} from 'liferay-js-toolkit-core';
import path from 'path';

import {project} from '../globals';
import * as log from '../log';
import report from '../report';
import {getDestDir, runInChunks} from '../util';
import {findFiles} from '../util/files';

/**
 * Run configured rules.
 */
export default function runRules(rootPkg: PkgDesc): Promise<void> {
	return processPackage(rootPkg);
}

function processPackage(srcPkg: PkgDesc): Promise<void> {
	const sourceGlobs = srcPkg.isRoot
		? project.sources.map((source) =>
				fs.statSync(project.dir.join(source).asNative).isDirectory()
					? `${source.asPosix}/**/*`
					: source.asPosix
		  )
		: ['**/*'];

	const globs = [...sourceGlobs, '!node_modules/**/*'];

	const sourcePrjRelPaths = findFiles(
		project.dir.asNative,
		prefixGlobs(`${project.dir.asPosix}/${srcPkg.dir.asPosix}/`, globs)
	).map((file) => file.asNative);

	if (sourcePrjRelPaths.length === 0) {
		return Promise.resolve();
	}

	log.debug(`Applying rules to package '${srcPkg.id}'...`);

	const destPkg = srcPkg.clone({
		dir: getDestDir(srcPkg),
	});

	return runInChunks(
		sourcePrjRelPaths,
		project.misc.maxParallelFiles,
		0,
		(prjRelPath) => processFile(srcPkg, destPkg, prjRelPath)
	);
}

function processFile(
	srcPkg: PkgDesc,
	destPkg: PkgDesc,
	prjRelPath: string
): Promise<void> {
	const loaders = project.rules.loadersForFile(prjRelPath);

	if (loaders.length === 0) {
		return Promise.resolve();
	}

	const fileAbsPath = project.dir.join(prjRelPath).asNative;

	const context: BundlerLoaderContext<string | Buffer> = {
		content: fs.readFileSync(fileAbsPath),
		extraArtifacts: {},
		filePath: prjRelPath,
		log: new PluginLogger(),
	};

	return runLoaders(loaders, 0, context)
		.then(() => writeLoadersResult(srcPkg, destPkg, context))
		.then(() => report.rulesRun(prjRelPath, context.log));
}

/**
 * Run rule loaders contained in an array starting at given index.
 * @param context the context object to pass to loaders
 * @return the processed context content
 */
function runLoaders(
	loaders: BundlerLoaderDescriptor[],
	firstLoaderIndex: number,
	context: BundlerLoaderContext<string | Buffer>
): Promise<string | Buffer> {
	if (firstLoaderIndex >= loaders.length) {
		return Promise.resolve(context.content);
	}

	const loader = loaders[firstLoaderIndex];
	const encoding = loader.metadata.encoding;

	let result;

	try {
		transformContents(true, context, encoding);

		result = loader.exec(context, loader.options);
	} catch (err) {
		err.message = `Loader '${loader.loader}' failed: ${err.message}`;
		throw err;
	}

	return Promise.resolve(result).then((content) => {
		if (content !== undefined) {
			context = Object.assign(context, {content});
		}

		transformContents(false, context, encoding);

		return runLoaders(loaders, firstLoaderIndex + 1, context);
	});
}

/**
 * Transform the contents (`content` and `extraArtifacts` value fields) from
 * Buffer to string with given `encoding` or the opposite way.

 * @param beforeInvocation true if called before invoking the loader
 */
export function transformContents(
	beforeInvocation: boolean,
	context: BundlerLoaderContext<string | Buffer>,
	encoding: BufferEncoding
): void {
	const {extraArtifacts, filePath} = context;

	if (beforeInvocation) {
		assertBuffer(context, 'content', filePath);
		Object.keys(extraArtifacts).forEach((key) => {
			assertBuffer(extraArtifacts, key, `extra artifact ${key}`);
		});

		if (encoding === null) {
			return;
		}

		if (context.content !== undefined) {
			context.content = context.content.toString(encoding);
		}

		Object.keys(extraArtifacts).forEach((key) => {
			if (extraArtifacts[key] !== undefined) {
				extraArtifacts[key] = extraArtifacts[key].toString(encoding);
			}
		});
	} else if (encoding === null) {
		assertBuffer(context, 'content', filePath);
		Object.keys(extraArtifacts).forEach((key) => {
			assertBuffer(extraArtifacts, key, `extra artifact ${key}`);
		});
	} else {
		assertString(context, 'content', filePath);
		Object.keys(extraArtifacts).forEach((key) => {
			assertString(extraArtifacts, key, `extra artifact ${key}`);
		});

		if (context.content !== undefined) {
			context.content = Buffer.from(context.content as string, encoding);
		}

		Object.keys(extraArtifacts).forEach((key) => {
			if (extraArtifacts[key] !== undefined) {
				extraArtifacts[key] = Buffer.from(
					extraArtifacts[key],
					encoding
				);
			}
		});
	}
}

/**
 * Assert that a given artifact content is of type `Buffer` and throw otherwise.
 */
function assertBuffer(object: object, field: string, what: string): void {
	if (object[field] === undefined) {
		return;
	}

	if (!(object[field] instanceof Buffer)) {
		throw new Error(
			`Expected content of ${what} to be a Buffer but was ` +
				`${typeof object[field]}`
		);
	}
}

/**
 * Assert that a given artifact content is of type `string` and throw otherwise.
 */
function assertString(object: object, field: string, what: string): void {
	if (object[field] === undefined) {
		return;
	}

	if (typeof object[field] !== 'string') {
		throw new Error(
			`Expected content of ${what} to be a string but was ` +
				`${typeof object[field]}`
		);
	}
}

function writeLoadersResult(
	srcPkg: PkgDesc,
	destPkg: PkgDesc,
	context: BundlerLoaderContext<string | Buffer>
): void {
	if (context.content != undefined) {
		writeRuleFile(
			destPkg,
			srcPkg.dir.relative(project.dir.join(context.filePath)).asNative,
			context.content
		);
	}

	Object.entries(context.extraArtifacts).forEach(
		([extraPrjRelPath, content]) => {
			if (content === undefined) {
				return;
			}

			writeRuleFile(
				destPkg,
				srcPkg.dir.relative(project.dir.join(extraPrjRelPath)).asNative,
				content
			);

			context.log.info(
				'liferay-npm-bundler',
				`Rules generated extra artifact: ${extraPrjRelPath}`
			);
		}
	);
}

/**
 * Write a file generated by a rule for a given destination package.
 */
function writeRuleFile(
	destPkg: PkgDesc,
	pkgRelPath: string,
	content: string | Buffer
): void {
	if (destPkg.isRoot) {
		pkgRelPath = stripSourceDir(pkgRelPath);
	}

	const fileAbsPath = project.dir.join(destPkg.dir, pkgRelPath).asNative;

	fs.ensureDirSync(path.dirname(fileAbsPath));
	fs.writeFileSync(fileAbsPath, content);
}

/**
 * String configured source prefixes from package file path.
 */
export function stripSourceDir(pkgRelPath: string): string {
	pkgRelPath = `.${path.sep}${pkgRelPath}`;

	for (const sourcePath of project.sources.map((source) => source.asNative)) {
		const prefixPath = `${sourcePath}${path.sep}`;

		if (pkgRelPath.startsWith(prefixPath)) {
			return pkgRelPath.substring(prefixPath.length);
		}
	}

	return pkgRelPath;
}
