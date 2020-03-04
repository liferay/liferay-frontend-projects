/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import PkgDesc from 'liferay-npm-build-tools-common/lib/pkg-desc';
import project from 'liferay-npm-build-tools-common/lib/project';
import pretty from 'pretty-time';

import {buildBundlerDir} from './dirs';
import createJar from './jar';
import * as log from './log';
import manifest from './manifest';
import report from './report';
import runRules from './steps/rules';
import runWebpack from './steps/webpack';

/** Default entry point for the liferay-npm-bundler */
export default async function(argv: {version: boolean}): Promise<void> {
	if (argv.version) {
		const {versionsInfo} = project;

		versionsInfo.forEach((value, key) => {
			console.log(`"${key}":`, JSON.stringify(value, null, 2));
		});

		return;
	}

	try {
		const {pkgJson, versionsInfo} = project;
		const rootPkg = new PkgDesc(pkgJson.name, pkgJson.version);

		const start = process.hrtime();

		// Report configurations
		report.rootPackage(rootPkg);
		report.rulesConfig(project.rules.config);
		report.versionsInfo(versionsInfo);

		// Warn about incremental builds
		if (manifest.loadedFromFile) {
			report.warn(
				'This report is from an incremental build: some steps may be ' +
					'missing (you may remove the output directory to force a ' +
					'full build).'
			);
		}

		// Do things
		copyPackageJson();
		await runWebpack();
		await runRules(rootPkg);
		saveManifest();
		if (project.jar.supported) {
			await createJar();
		}

		// Report and show execution time
		const hrtime = process.hrtime(start);
		report.executionTime(hrtime);
		log.success(`Bundled {${pkgJson.name}} in`, pretty(hrtime));

		// Write report if requested
		if (project.misc.reportFile) {
			fs.writeFileSync(project.misc.reportFile.asNative, report.toHtml());

			log.info(`Report written to ${project.misc.reportFile.asNative}`);
		} else if (report.warningsPresent) {
			log.debug('The build has emitted some warning messages.');
		}
	} catch (err) {
		log.error(`\n\n${err.stack}\n\n`);

		process.exit(1);
	}
}

function copyPackageJson(): void {
	fs.copyFileSync(
		project.dir.join('package.json').asNative,
		buildBundlerDir.join('package.json').asNative
	);

	log.debug('Copied package.json to output directory');
}

function saveManifest(): void {
	manifest.save();

	log.debug('Wrote manifest.json to output directory');
}
