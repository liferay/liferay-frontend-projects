const fs = require('fs');
const https = require('https');

const DEV_DEPENDENCIES_PATH = require.resolve(
	'../packages/liferay-theme-tasks/lib/devDependencies.js'
);
const SIGNIFICANT_DEPS = [
	'liferay-frontend-css-common',
	'liferay-frontend-theme-styled',
	'liferay-frontend-theme-unstyled',
];

async function main(argv) {
	const {theme: themeDeps} = require(DEV_DEPENDENCIES_PATH);

	const currentVersions = {};
	const wantedVersions = {};

	for (const dxpVersion of Object.keys(themeDeps)) {
		const {default: depVersions} = themeDeps[dxpVersion];

		console.log('');
		console.log('');
		console.log(`== DXP ${dxpVersion} ========`);

		currentVersions[dxpVersion] = {};
		wantedVersions[dxpVersion] = {};

		for (const dep of SIGNIFICANT_DEPS) {
			const depVersion = depVersions[dep];

			if (!depVersion) {
				continue;
			}

			const versionSeries = depVersion.replace(/\..*/, '');

			console.log('');
			console.log(dep);
			console.log('    Current version:', depVersion);
			console.log('    Versions series:', versionSeries);
			process.stdout.write('    Latest version:  ');

			const npmVersions = await getNpmVersions(dep);

			const latestVersion = getLatestVersion(npmVersions, versionSeries);

			console.log(latestVersion);

			currentVersions[dxpVersion][dep] = depVersion;
			wantedVersions[dxpVersion][dep] = latestVersion;
		}
	}

	console.log('');
	console.log('');

	if (argv[2] === '--check' || argv[2] === '-c') {
		let rc = 0;

		for (const dxpVersion of Object.keys(themeDeps)) {
			for (const dep of SIGNIFICANT_DEPS) {
				const current = currentVersions[dxpVersion][dep];

				if (!current) {
					continue;
				}

				const wanted = wantedVersions[dxpVersion][dep];

				if (current !== wanted) {
					rc = 1;
				}
			}
		}

		if (rc === 0) {
			console.log(`No obsolete dependencies found 🎉`);
		}
		else {
			console.log(`Some obsolete dependencies were found 😭`);
		}

		console.log('');
		console.log('');

		process.exit(rc);
	}
	else {
		let jsCode = fs.readFileSync(DEV_DEPENDENCIES_PATH, 'utf-8');

		for (const dxpVersion of Object.keys(themeDeps)) {
			for (const dep of SIGNIFICANT_DEPS) {
				const current = currentVersions[dxpVersion][dep];

				if (!current) {
					continue;
				}

				const wanted = wantedVersions[dxpVersion][dep];

				const regexp = `'${dep}': strict[(]'${current}'[)]`;
				const replacement = `'${dep}': strict('${wanted}')`;

				jsCode = jsCode.replace(new RegExp(regexp), replacement);
			}
		}

		fs.writeFileSync(DEV_DEPENDENCIES_PATH, jsCode);

		console.log('Patched liferay-theme-tasks 💪');

		console.log('');
		console.log('');
	}
}

function getLatestVersion(versions, versionSeries) {
	return Object.keys(versions)
		.filter((version) => version.startsWith(`${versionSeries}.`))
		.sort((a, b) => {
			const aparts = a.split('.');
			const bparts = b.split('.');

			for (let i = 0; ; i++) {
				if (aparts[i] !== undefined && bparts[i] !== undefined) {
					return -1;
				}
				else if (aparts[i] === undefined && bparts[i] !== undefined) {
					return 1;
				}
				else if (aparts[i] > bparts[i]) {
					return -1;
				}
				else if (aparts[i] < bparts[i]) {
					return 1;
				}

				return 0;
			}
		})[0];
}

async function getNpmVersions(pkgName) {
	return new Promise((resolve, reject) => {
		https
			.get(`https://registry.npmjs.com/${pkgName}`, (res) => {
				res.setEncoding('utf8');

				let data = '';

				res.on('data', (chunk) => {
					data += chunk.toString();
				});

				res.on('end', () => {
					resolve(JSON.parse(data)['versions']);
				});
			})
			.on('error', reject);
	});
}

main(process.argv).catch(console.error);
