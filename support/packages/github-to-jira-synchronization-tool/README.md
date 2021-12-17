# Github to Jira synchronization tool

This project aims to be a replacement for Exalate, to update Jira issues based on the state of the Github issues. It is a node app that leverages Github webhooks to do so.

# Install the tool

More information on how to configure these repos, deploy and use this tool can be found in [this Confluence page](https://liferay.atlassian.net/wiki/spaces/ENGFRONTENDINFRA/pages/1954447876/Github+to+Jira+synchronization+tool).

# How it works

This tool leverages Github webhooks, specificially issues and issue comments. Each event is handled by a different JS file, all the event handlers can be found [here](https://github.com/liferay/liferay-frontend-projects/tree/98aef031f203f1718fdc5bdd05449b7410b304e2/support/packages/github-to-jira-synchronization-tool/src/event-handlers).

It is implemented as a node http server, that exposes the endpoint `/api/github/webhooks` where it processes each webhook event.

## Retries

Since Jira may be down, but Github not. We need to make sure that events that reach the server while Jira is down are retried later. Each time that a webhook event handler fails because of a server error, the webhook is stored in a file. Every hour the file is checked and tries to proccess the event again.

## Mapping configuration

A mapping configuration is needed to convert from Github usernames to Jira issues and from Github labels to Jira issue types. This configuaration is set in the [mapping-config.json file](https://github.com/liferay/liferay-frontend-projects/blob/98aef031f203f1718fdc5bdd05449b7410b304e2/support/packages/github-to-jira-synchronization-tool/mapping-config.json).

This is an extract of the configuration:

```json
{
	"labelMappings": {
		"default": "Task",
		"bug": "Bug",
		"chore": "Task",
		"enhancement": "Story",
		"regression": "Bug"
	},
	"userMappings": {
		"brunofernandezg": "bruno.fernandez",
		"bryceosterhaus": "bryce.osterhaus",
		"carloslancha": "carlos.lancha"
	}
}
```

Label mapping is used when labeling a Github issue, depending on the label, a different Jira issue type is set. The same way with users, the left side of the JSON is the Github username and the right side is the Jira username.

# Past resources

The old Exalate documentation can be found [here](https://github.com/liferay/liferay-frontend-projects/tree/98aef031f203f1718fdc5bdd05449b7410b304e2/support/github-to-jira-synchronization).
