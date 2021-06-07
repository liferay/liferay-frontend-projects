/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const Airtable = require('airtable');
const cliProgress = require('cli-progress');

const progress = new cliProgress.MultiBar(
	{
		clearOnComplete: false,
		format:
			'{output} | [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}',
		hideCursor: true,
	},
	cliProgress.Presets.shades_grey
);

/**
 * Stores the modules' dependencies report in an Airtable base prepared to that effect.
 *
 * The setup in advance requires:
 * - An existing Airtable Base
 * 		- Key for the Base can be provided as `--airtableBaseKey` or as an `LFR_DEPS_AIRTABLE_BASE_KEY` environment variable.
 * - A valid API_KEY for the Airtable Base
 * 		- The API_KEY can be provided as `--airtableApiKey` or as an `LFR_DEPS_AIRTABLE_API_KEY` environment variable.
 * - An existing Airtable Table with the following structure:
 * 		- {string} module - Name of the module with the dependencies. Acts as the primary key of the table.
 * 		- {string} app - Parent application of the module.
 * 		- {URL} url - GitHub URL of the module.
 * 		- {[string]} clay3 - List of dependencies with Clay3 packages (@clayui/*).
 * 		- {[string]} react - List of dependencies with React packages (frontend-js-react-web).
 * 		- {[string]} js - List of dependencies with the common package (frontend-js-web).
 * 		- {[string]} metal - List of dependencies with Metal.js packages (metal-*).
 * 		- {[string]} clay2 - List of dependencies with Clay2 packages (clay-*).
 * 		- {[string]} others - List of other dependencies.
 *
 * 		- The Table name should be provided as `--output`. If none is passed, it defaults to `master`.
 */
module.exports = async function (modulesInfo, config) {
	const {airtableApiKey, airtableBaseKey, output} = {
		airtableApiKey: process.env.LFR_DEPS_AIRTABLE_API_KEY,
		airtableBaseKey: process.env.LFR_DEPS_AIRTABLE_BASE_KEY,
		output: 'master',
		...config,
	};

	const base = new Airtable({apiKey: airtableApiKey}).base(airtableBaseKey);

	const progressBar = progress.create(modulesInfo.length, 0, {output});
	let synced = 0;

	while (synced < modulesInfo.length) {

		// Airtable API only allows creating up to 10 records per request. It also expects a flat Map<string, object> `fields` parameter

		const chunk = modulesInfo
			.slice(synced, synced + 10)
			.map((moduleInfo) => {
				return {
					fields: {
						app: moduleInfo.meta.app,
						module: moduleInfo.meta.name,
						url: moduleInfo.meta.url,
						...moduleInfo.dependencies,
					},
				};
			});

		try {
			await base(output).create(chunk, {
				typecast: true,
			});
		}
		catch (error) {
			console.error(error);
		}

		synced += 10;
		progressBar.update(synced);
	}

	progress.stop();
};
