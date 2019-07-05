/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';

export function processFile(filePath, srcPkg, pkg, rule) {
	return new Promise((resolve, reject) => {
		let destPath = filePath.replace(srcPkg.dir, pkg.dir);
		destPath = destPath.replace('/src', '');

		if (rule.extension) {
			destPath = destPath.concat(rule.extension);
		}

		const dir = destPath.substring(0, destPath.lastIndexOf('/'));

		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, {recursive: true});
		}

		fs.copyFileSync(filePath, destPath);

		const content = fs.readFileSync(destPath, 'utf8');

		const loaders = rule.loaders;

		const iterateLoaders = (loaders, content, asyncProcess) => {
			if (loaders.length == 0) {
				return Promise.resolve(content);
			}

			return asyncProcess(loaders[0], content).then(content =>
				iterateLoaders(loaders.slice(1), content, asyncProcess)
			);
		};

		const promise = iterateLoaders(loaders, content, (loader, content) => {
			return new Promise((resolve, reject) => {
				Promise.resolve(loader.exec(content))
					.then(resolve)
					.catch(reject);
			});
		});

		promise
			.then(content => {
				fs.writeFileSync(destPath, content);
				resolve();
			})
			.catch(reject);
	});
}
