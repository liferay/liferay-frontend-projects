/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import postcss from 'postcss';
import {getModulesPlugins} from './utils';

/**
 * @return Processed content
 */
export default function(content) {
	return new Promise((resolve, reject) => {
		const plugins = getModulesPlugins();

		postcss(plugins)
			.process(content, {
				from: undefined,
				to: undefined,
			})
			.then(result => {
				const css = result.css;
				const json = result.messages.find(
					m => m.plugin === 'postcss-modules'
				).exportTokens;

				const fileContent = [
					`var css = "${css.replace(/\n/g, '')}";`,
					'var style = document.createElement("style");',
					'style.setAttribute("type", "text/css");',
					'style.appendChild(document.createTextNode(css));',
					'document.querySelector("head").appendChild(style);',
					'',
					`module.exports = ${JSON.stringify(json)};`,
				].join('\n');

				resolve(fileContent);
			})
			.catch(reject);
	});
}
