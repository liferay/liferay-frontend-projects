/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Get the OSGi bundle version from the package.json version. Respects
 * the different types of version classifiers.
 * @return {object}
 */
export function getBundleVersionAndClassifier(pkgJsonVersion) {
	const parts = pkgJsonVersion.split('-');
	if (parts.length > 1) {
		return parts[0] + '.' + parts.slice(1).join('-');
	}
	else {
		return pkgJsonVersion;
	}
}
