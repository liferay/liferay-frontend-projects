/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import chalk from 'chalk';

/**
 * Formatting options may be added by setting the `LR_FORMAT_OPTS` environment
 * variable. It is supposed to be a comma separated list of options.
 *
 * Valid options are:
 *
 *   * `no-colors`: don't use colors for texts
 *   * `no-decorations`: don't use font decorations or emojis
 *
 */
const lrFormatOpts = (process.env['LR_FORMAT_OPTS'] || '').split(',');
const opts = {
	noColors: lrFormatOpts.indexOf('no-colors') != -1,
	noDecorations: lrFormatOpts.indexOf('no-decorations') != -1,
};

const verbatim = (...args) => args.join(' ');
const fmt = {
	bold: opts.noDecorations ? verbatim : chalk.bold,
	error: opts.noColors ? verbatim : chalk.hex('#F44'),
	info: opts.noColors ? verbatim : chalk.hex('#888'),
	question: opts.noColors ? verbatim : chalk.hex('#55F'),
	success: opts.noColors ? verbatim : chalk.hex('#0A0'),
	title: opts.noColors ? verbatim : chalk.bold.hex('#55F'),
	underline: opts.noDecorations ? verbatim : chalk.underline,
	warn: opts.noColors ? verbatim : chalk.hex('#CA0'),
};

export function error(literals, ...values) {
	return fmt.error(format('❌', literals, values));
}

export function info(literals, ...values) {
	return fmt.info(format('ℹ️', literals, values));
}

/**
 * Print an array of lines separating them with CRs or a single line.
 *
 * It takes care of removing:
 *
 *   * Words inside `||` if `no-decorations` option is set
 *
 * And also decorates (unless `no-decorations` is provided):
 *
 *   * URLs starting with `http(s)://` with underline
 *   * Words inside `{}` with bold
 *
 * Each passed line is processed by the `removeJsFormatWhitespace` function.
 *
 * @param {Array|string} lines
 */
export function print(lines) {
	if (!Array.isArray(lines)) {
		lines = [lines];
	}

	lines = lines.map(line => {
		line = removeJsFormatWhitespace(line);

		line = line.replace(/(https?:\/\/[^\s]+)/gm, fmt.underline('$1'));
		line = line.replace(/{([^}]*)}/gm, fmt.bold('$1'));
		line = line.replace(/\|([^|]*)\|/g, opts.noDecorations ? '' : '$1');

		return line;
	});

	console.log(lines.join('\n'));
}

export function success(literals, ...values) {
	return fmt.success(format('✔️', literals, values));
}

export function question(literals, ...values) {
	return fmt.question(format('🙋', literals, values));
}

export function title(literals, ...values) {
	return fmt.title(format('', literals, values));
}

export function warn(literals, ...values) {
	return fmt.warn(format('⚠️', literals, values));
}

/**
 * This is an ES6 template unrolling function that optionally prefixes the final
 * string with an emoji.
 *
 * The emoji is treated as a decoration and thus removed if the `no-decorations`
 * option is set.
 *
 * The resulting string is processed by the `removeJsFormatWhitespace` function.
 *
 * @param {string} emoji an emoji or an empty string to prefix the text
 * @param {Array<string>} literals
 * @param  {...any} values
 */
function format(emoji, literals, ...values) {
	let ret = literals[0];

	for (let i = 0; i < values.length; i++) {
		ret += values[i];

		if (i + 1 < literals.length) {
			ret += literals[i + 1];
		}
	}

	ret = removeJsFormatWhitespace(ret);
	ret = (emoji ? `|${emoji} |` : '') + ret;

	return ret;
}

/**
 * This function removes:
 *
 *   * A leading CR in the first line if it exists
 *   * Two tabs at the begining of each line
 *
 * This is to enhance legibility of JS code when it is formatted according to
 * the project's rules.
 *
 * This function is (and must always be) idempotent because it may need to be
 * applied several times to the same line.
 * @param {string} line
 */
function removeJsFormatWhitespace(line) {
	line = line.replace(/^\n/, '');
	line = line.replace(/^\t\t/gm, '');

	return line;
}
