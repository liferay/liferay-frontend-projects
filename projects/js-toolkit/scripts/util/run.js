/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const execa = require('execa');

async function run(cmd, ...args) {
	let options = {};

	if (typeof args[args.length - 1] === 'object') {
		options = args.pop();
	}

	const {stderr, stdout} = await execa(cmd, args, options);

	stdout.stderr = stderr;

	return stdout;
}

run.pipe = async (cmd, ...args) => {
	let options = {};

	if (typeof args[args.length - 1] === 'object') {
		options = args.pop();
	}

	const promise = execa(cmd, args, options);

	promise.stdout.pipe(process.stdout);

	const {stderr, stdout} = await promise;

	stdout.stderr = stderr;

	return stdout;
};

const git = async (...args) => await run('git', ...args);
git.pipe = async (...args) => await run.pipe('git', ...args);

const runNodeBin = async (bin, ...args) =>
	await run(bin, ...args, {preferLocal: true});
runNodeBin.pipe = async (bin, ...args) =>
	await run.pipe(bin, ...args, {preferLocal: true});

const yarn = async (...args) => await run('yarn', ...args);
yarn.pipe = async (...args) => await run.pipe('yarn', ...args);

module.exports = {
	git,
	run,
	runNodeBin,
	yarn,
};
