/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

function addGithubIssueToBody(issueUrl, body = '') {
	return `
${body}

------ Do not edit the text below ------

${getGithubMarking(issueUrl)}
`;
}

function getGithubMarking(githubIssueUrl) {
	return `__Create automatically from: ${githubIssueUrl} ___`;
}

module.exports = {
	addGithubIssueToBody,
	getGithubMarking,
};
