const {createHash} = require('crypto');
const fs = require('fs');
const {spawnSync} = require('child_process');
const path = require('path');

const ACTUAL_BUILD_DIR = path.resolve(__dirname, '../qa/test-project/build');
const EXPECTED_BUILD_DIR = path.resolve(
	__dirname,
	'../qa/test-project/build.expected'
);
const TEST_PROJECT_DIR = path.resolve(__dirname, '../qa/test-project');

function diff(expectedDir, actualDir) {
	let somethingChanged = false;

	const expectedItems = fs.readdirSync(expectedDir);
	const actualItems = fs.readdirSync(actualDir);

	for (const actualItem of actualItems) {
		if (!expectedItems.includes(actualItem)) {
			somethingChanged = true;
			console.log('+', path.join(actualDir, actualItem));
		}
	}

	for (const expectedItem of expectedItems) {
		const actualFile = path.resolve(actualDir, expectedItem);
		const expectedFile = path.resolve(expectedDir, expectedItem);

		if (fs.statSync(expectedFile).isDirectory()) {
			somethingChanged =
				somethingChanged || diff(expectedFile, actualFile);
		}
		else if (!actualItems.includes(expectedItem)) {
			somethingChanged = true;
			console.log('-', path.join(actualDir, expectedItem));
		}
		else {
			const expectedHash = createHash('sha256')
				.update(fs.readFileSync(expectedFile))
				.digest('hex');
			const actualHash = createHash('sha256')
				.update(fs.readFileSync(actualFile))
				.digest('hex');

			if (expectedHash !== actualHash) {
				somethingChanged = true;
				console.log('*', path.join(actualDir, expectedItem));
			}
		}
	}

	return somethingChanged;
}

function run(cmd, ...args) {
	console.log('\n>>>', cmd, args.join(' '));

	const result = spawnSync(cmd, args, {
		cwd: TEST_PROJECT_DIR,
		shell: true,
		stdio: 'inherit',
	});

	if (result.status) {
		process.exit(result.status);
	}
}

run('yarn');

run('yarn', 'clean');

run('yarn', 'build');

console.log('\n>>> diff', EXPECTED_BUILD_DIR, ACTUAL_BUILD_DIR, '\n');
if (diff(EXPECTED_BUILD_DIR, ACTUAL_BUILD_DIR)) {
	console.log('\n🔴 BUILDS DIFFER :-(\n');
	process.exit(1);
}
else {
	console.log('\n✅ BUILDS ARE IDENTICAL \\o/\n');
}
