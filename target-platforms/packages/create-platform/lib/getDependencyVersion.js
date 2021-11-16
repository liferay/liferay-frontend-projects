/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

module.exports = function getDependencyVersion(packageName, portalYarnLock) {
	const lineIndex = portalYarnLock.findIndex(
		(line) =>
			line.startsWith(`"${packageName}@`) ||
			line.startsWith(`${packageName}@`)
	);

	const versionLine = portalYarnLock[lineIndex + 1];

	if (!versionLine) {
		return undefined;
	}

	return versionLine.split('"')[1];
};
