/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const {spawnSync} = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const copy = (input, output) =>
	fs.copySync(input, output, {
		filter: (filePath) => !path.basename(filePath).startsWith('.'),
	});

function run(binary, ...args) {
	return run.withEnv(null, binary, ...args);
}

run.withEnv = function (env, binary, ...args) {
	const options = {
		shell: true,
		stdio: 'inherit',
	};

	if (env) {
		options['env'] = env;
	}

	const {error, signal, status, stderr, stdout} = spawnSync(
		binary,
		args,
		options
	);

	if (status !== 0) {
		throw new Error(
			`${binary} ${args.join(
				' '
			)} exited with status ${status}, error ${error}, signal ${signal}, and output:

${stdout}

${stderr}
			`
		);
	}
};

module.exports = {copy, run};
