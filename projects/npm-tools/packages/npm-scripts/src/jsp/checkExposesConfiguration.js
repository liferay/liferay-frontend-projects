/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

const getMergedConfig = require('../utils/getMergedConfig');
const getTaglibInvocations = require('./getTaglibInvocations');

const TAGLIBS = {
	'aui:script': {
		attributes: ['require'],
	},
	'liferay-frontend:component': {
		attributes: ['module'],
	},
	'react:component': {
		attributes: ['module', 'propsTransformer'],
	},
	'soy:template-renderer': {
		attributes: ['module'],
	},
};

/**
 * Scans JSP files for JS modules and reports linting errors for those not
 * included in the `exposes` section for the `npmscripts.config.js` file.
 */
module.exports = function (source) {
	const config = getMergedConfig('npmscripts');

	if (!fs.existsSync(config.build.input)) {
		return [];
	}

	const invocations = getTaglibInvocations(source, ...Object.keys(TAGLIBS));

	const moduleNames = new Set();

	for (const invocation of invocations) {
		const {attributes: validAttributes} = TAGLIBS[invocation.tag];
		const {attributes} = invocation;

		for (const validAttribute of validAttributes) {
			const attribute = attributes[validAttribute];

			if (!attribute) {
				continue;
			}

			attribute
				.split(',')
				.map((part) => part.split(/\s+as\s+/)[0])
				.forEach((moduleName) => moduleNames.add(moduleName));
		}
	}

	const messages = [];

	const federation =
		typeof config.federation === 'object' ? config.federation : {};
	const exposes = federation.exposes || [];

	for (const moduleName of moduleNames) {
		if (moduleName.includes('<%=')) {
			continue;
		}

		const modulePath = `${moduleName}.js`;

		if (!fs.existsSync(path.join(config.build.input, modulePath))) {
			continue;
		}

		if (!exposes.includes(`<inputDir>/${modulePath}`)) {
			messages.push({
				column: 0,
				line: 0,
				message:
					`Module '${modulePath}' is not configured in the ` +
					`'exposes' section of 'npmscripts.config.js'`,
				ruleId: 'check-exposes',
				severity: 1, // warning
			});
		}
	}

	return messages;
};
