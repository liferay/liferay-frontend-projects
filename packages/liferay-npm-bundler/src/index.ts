/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import PkgDesc from 'liferay-npm-build-tools-common/lib/pkg-desc';
import project from 'liferay-npm-build-tools-common/lib/project';
import pretty from 'pretty-time';

import createJar from './jar';
import * as log from './log';
import manifest from './manifest';
import report from './report';

import runRules from './steps/rules';

/** Default entry point for the liferay-npm-bundler */
export default function(argv: {version: boolean}): void {
	const {pkgJson, versionsInfo} = project;

	if (argv.version) {
		versionsInfo.forEach((value, key) => {
			console.log(`"${key}":`, JSON.stringify(value, null, 2));
		});
		return;
	}

	const rootPkg = new PkgDesc(pkgJson['name'], pkgJson['version']);

	report.versionsInfo(versionsInfo);

	try {
		const start = process.hrtime();

		// Report root package
		report.rootPackage(rootPkg);

		// Report rules config
		report.rulesConfig(project.rules.config);

		// Warn about incremental builds
		if (manifest.loadedFromFile) {
			report.warn(
				'This report is from an incremental build: some steps may be ' +
					'missing (you may remove the output directory to force a ' +
					'full build).'
			);
		}

		// Do things
		runRules(rootPkg)
			.then(() => manifest.save())
			.then(() => (project.jar.supported ? createJar() : undefined))
			.then(() => {
				// Report and show execution time
				const hrtime = process.hrtime(start);
				report.executionTime(hrtime);
				log.info(`Bundling took ${pretty(hrtime)}`);

				// Write report if requested
				if (project.misc.reportFile) {
					fs.writeFileSync(
						project.misc.reportFile.asNative,
						report.toHtml()
					);

					log.info(
						`Report written to ${project.misc.reportFile.asNative}`
					);
				} else if (report.warningsPresent) {
					log.debug('The build has emitted some warning messages.');
				}
			})
			.catch(abort);
	} catch (err) {
		abort(err);
	}
}

/** Abort execution after showing error message */
function abort(err: any): void {
	log.error(`

${err.stack}

`);

	process.exit(1);
}
