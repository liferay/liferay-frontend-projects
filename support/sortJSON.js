/**
 * Companion tool to Prettier that sorts JSON files.
 */

const fs = require('fs');

const HELP_REGEXP = /^--?h(?:elp)?/;

const STDIN = 0;

const TAB_WIDTH = 4;

function print(string = '') {
	process.stdout.write(`${string}\n`);
}

/**
 * Sort contents in-place.
 *
 * Obviously doesn't deal with anything crazy like circular references, but we
 * won't have any of those because our input comes from `JSON.parse()`.
 */
function sort(json) {
	if (Array.isArray(json)) {
		json.forEach(sort);
	} else if (Object.prototype.toString.call(json) === '[object Object]') {
		const entries = Object.entries(json);

		entries.sort(([a], [b]) => {
			if (a < b) {
				return -1;
			} else if (a > b) {
				return 1;
			} else {
				return 0;
			}
		});

		entries.forEach(([key, value]) => {
			delete json[key];

			sort(value);
		});

		entries.forEach(([key, value]) => {
			json[key] = value;
		});
	}
}

function usage() {
	print(`${__filename}:`);
	print();
	print('Read filenames from STDIN, and writes sorted JSON in-place.');
	print();
	print('Example:');
	print();
	print('  find . \\');
	print('    -name package.json \\');
	print("    -path '*/js-toolkit/*' \\");
	print("    -not -path '*/node_modules/*' \\");
	print("    -not -path '*/__tests__/*' \\");
	print("    -not -path '*/__fixtures/__*' \\");
	print("    -not -path '*/qa/samples/*' | node support/sortJSON.js");
	print();

	process.exit();
}

if (process.argv.some((arg) => HELP_REGEXP.test(arg))) {
	usage();
}

print('Reading filenames from STDIN... [Ctrl-D to exit]');

const filenames = fs.readFileSync(STDIN).toString().split(/\n/).filter(Boolean);

if (!filenames.length) {
	usage();
}

filenames.forEach((filename) => {
	const contents = JSON.parse(fs.readFileSync(filename));

	sort(contents);

	const stringified = JSON.stringify(contents, null, 4) + '\n';

	const tabbed = stringified.replace(/^ +/gm, (match) => {
		return '\t'.repeat(Math.floor(match.length / TAB_WIDTH));
	});

	fs.writeFileSync(filename, tabbed);

	print(`Wrote ${filename}`);
});
