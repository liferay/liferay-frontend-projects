import path from 'path';
import readJsonSync from 'read-json-sync';
import semver from 'semver';

/**
 * @return {void}
 */
export default function({log}, {pkgJson}) {
	if (pkgJson.dependencies != null) {
		Object.keys(pkgJson.dependencies).forEach(name => {
			const link = pkgJson.dependencies[name];

			if (semver.validRange(link) == null) {
				const depPkgJsonPath = path.join(
					link.replace('file:', ''),
					'package.json'
				);

				const depPkgJson = readJsonSync(depPkgJsonPath);

				pkgJson.dependencies[name] = depPkgJson.version;

				log.info(
					'resolve-linked-dependencies',
					'Resolved link',
					link,
					'to',
					depPkgJson.version
				);
			}
		});
	}
}
