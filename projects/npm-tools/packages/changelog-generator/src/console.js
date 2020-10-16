/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const {createInterface} = require('readline');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const YELLOW = '\x1b[33m';

let readline;

/**
 * Releases any previously acquired readline resources.
 */
function cleanup() {
	if (readline) {
		readline.close();

		readline = undefined;
	}
}

/**
 * Log a line to stderr, using error formatting.
 */
function error(...args) {
	log(`${RED}error: ${args.join('\n')}${RESET}`);
}

/**
 * Log a line to stderr, using green formatting.
 */
function info(...args) {
	log(`${GREEN}${args.join('\n')}${RESET}`);
}

/**
 * Log a line to stderr.
 */
function log(...args) {
	process.stderr.write(`${args.join('\n')}\n`);
}

/**
 * Prompt the user for input.
 */
function prompt(question, choices) {
	if (!readline) {
		readline = createInterface({
			input: process.stdin,
			output: process.stdout,
		});
	}

	if (choices.length) {
		log('');

		choices.forEach((choice, i) => {
			log(`${i + 1}. ${choice}`);
		});

		log('');
	}

	return new Promise((resolve) => {
		readline.question(`${question} `, resolve);
	}).then((result) => {
		if (result.match(/^\s*-?\d+\s*$/)) {
			const number = result;

			if (number > 0 && number <= choices.length) {
				return choices[number - 1];
			}
			else {
				log('');

				warn(`Valid choices lie between 1 and ${choices.length}`);

				return prompt(question, choices);
			}
		}
		else {
			return result.trim();
		}
	});
}

/**
 * Log a line to stderr, using warning formatting.
 */
function warn(...args) {
	log(`${YELLOW}warning: ${args.join('\n')}${RESET}`);
}

module.exports = {
	cleanup,
	error,
	info,
	log,
	prompt,
	warn,
};
