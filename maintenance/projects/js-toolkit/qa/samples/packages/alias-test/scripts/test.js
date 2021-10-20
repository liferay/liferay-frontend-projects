require('colors');
const spawn = require('cross-spawn');
const diff = require('diff');
const path = require('path');

const prjDirPath = path.join(__dirname, '..');

const webpackOutput = run('run-webpack');
const bundlerOutput = run('run-bundler');

var comparison = diff.diffLines(webpackOutput, bundlerOutput);

comparison.forEach((part) => {

	// green for additions, red for deletions
	// grey for common parts

	const color = part.added ? 'green' : part.removed ? 'red' : 'grey';

	process.stdout.write(part.value[color]);
});

function run(target) {
	const proc = spawn.sync('yarn', [target], {
		cwd: prjDirPath,
	});

	if (proc.error) {
		abort(`${target}:`, proc.error);
	}
	if (proc.signal) {
		abort(
			`${target}:`,
			`Caught signal ${proc.signal}
	${proc.stdout}
	${proc.stderr}`
		);
	}
	if (proc.status !== 0) {
		abort(
			`${target}:`,
			`Exit with status code ${proc.status}
	${proc.stdout}
	${proc.stderr}`
		);
	}

	const out = proc.stdout.toString();
	const i = out.indexOf('8< --------');
	const j = out.indexOf('-------- >8');

	return out.substring(i + 13, j);
}

function abort(...msg) {
	console.log(...msg);
	process.exit(1);
}
