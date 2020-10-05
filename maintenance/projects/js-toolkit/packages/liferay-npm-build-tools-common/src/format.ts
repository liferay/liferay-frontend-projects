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
 * Valid formatting options are:
 *
 *   * `no-colors`: don't use colors for texts
 *   * `no-decorations`: don't use font decorations or emojis
 *
 */
const lrFormatOpts = (process.env['LR_FORMAT_OPTS'] || '').split(',');

/** Unrolled formatting options */
const opts = {
	noColors: lrFormatOpts.indexOf('no-colors') != -1,
	noDecorations: lrFormatOpts.indexOf('no-decorations') != -1,
};

const verbatim = (...args) => args.join(' ');

/** Chalk formats table */
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

/**
 * Tagged template processor for error messages.
 *
 * Example of use:
 *
 * ```ts
 * error`
 *   This is an error message with some ${argument} to show
 * `
 * ```
 *
 * @remarks
 * Error messages are prepended with a '❌' emoji.
 */
export function error(literals, ...values) {
	return fmt.error(format('❌', literals, values));
}

/**
 * Tagged template processor for information messages.
 *
 * Example of use:
 *
 * ```ts
 * info`
 *   This is an information message with some ${argument} to show
 * `
 * ```
 *
 * @remarks
 * Error messages are prepended with a 'ℹ️' emoji.
 */
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
 * Each passed line is processed by the {@link removeJsFormatWhitespace}
 * function.
 */
export function print(lines: string | string[], ...rest: string[]): void {
	if (!Array.isArray(lines)) {
		lines = [lines];
	}

	if (rest !== undefined) {
		lines.push(...rest);
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

/**
 * Tagged template processor for success messages.
 *
 * Example of use:
 *
 * ```ts
 * success`
 *   This is a success message with some ${argument} to show
 * `
 * ```
 *
 * @remarks
 * Error messages are prepended with a '✔️' emoji.
 */
export function success(literals, ...values) {
	return fmt.success(format('✔️', literals, values));
}

/**
 * Tagged template processor for question messages.
 *
 * Example of use:
 *
 * ```ts
 * question`
 *   Is this a question message with some ${argument} to show?
 * `
 * ```
 *
 * @remarks
 * Error messages are prepended with a '❓' emoji.
 */
export function question(literals, ...values) {
	return fmt.question(format('❓', literals, values));
}

/**
 * Tagged template processor for titles.
 *
 * Example of use:
 *
 * ```ts
 * title`
 *   This is a title with some ${argument} to show
 * `
 * ```
 */
export function title(literals, ...values) {
	return fmt.title(format('', literals, values));
}

/**
 * Tagged template processor for warning messages.
 *
 * Example of use:
 *
 * ```ts
 * warn`
 *   This is an warning message with some ${argument} to show
 * `
 * ```
 *
 * @remarks
 * Error messages are prepended with a '⚠️' emoji.
 */
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
 * @param emoji an emoji or empty string to prefix the text
 */
function format(emoji: string, literals: string[], values: any[]): string {
	let ret: string = literals[0];

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
 */
function removeJsFormatWhitespace(line: string): string {
	line = line.replace(/^\n/, '');
	line = line.replace(/^\t*/gm, '');

	return line;
}
