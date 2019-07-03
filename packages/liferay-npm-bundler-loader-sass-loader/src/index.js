/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * @return Processed content
 */
export default function(content) {
	const self = this;

	function getDefaultRenderer() {
		let sassImplPkg = 'node-sass';

		try {
			require.resolve('node-sass');
		} catch (error) {
			try {
				require.resolve('sass');
				sassImplPkg = 'sass';
			} catch (ignoreError) {
				sassImplPkg = 'node-sass';
			}
		}

		return require(sassImplPkg);
	}

	function getRenderer() {
		const options = self.options || {};
		const impl = options.implementation;

		return impl ? require(impl) : getDefaultRenderer();
	}

	const renderOptions = Object.assign(
		{
			data: content,
		},
		self.options
	);

	const renderer = getRenderer();

	const result = renderer.renderSync(renderOptions);

	const css = result.css.toString();

	return css;
}
