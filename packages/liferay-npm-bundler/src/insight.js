import Insight from 'insight';
import path from 'path';
import readJsonSync from 'read-json-sync';

const GA_TOKEN = 'UA-37033501-13';

export let PROJECT_NAME;
export let PROJECT_VERSION;

let insight;

/**
 * Initialize insight facility
 * @return {Promise} a promise fulfilled when initialization is done
 */
export function init() {
	return new Promise(resolve => {
		try {
			const projectPkgJson = readJsonSync(
				path.join(process.cwd(), 'package.json')
			);

			PROJECT_NAME = projectPkgJson.name;
			PROJECT_VERSION = projectPkgJson.version;

			insight = new Insight({
				trackingCode: GA_TOKEN,
				pkg: require('../package.json'),
			});
		} catch (err) {
			// ignore
		}

		if (insight && insight.optOut === undefined) {
			insight.askPermission(undefined, resolve);
		} else {
			resolve();
		}
	});
}

export const track = (...args) => {
	if (insight) {
		insight.track(
			insight.config.get('clientId'),
			insight.PROJECT_NAME,
			...args
		);
	}
};
