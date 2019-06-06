# Liferay Frontend Guidelines

This is a live (changing) repository containing [guidelines](/guidelines) for doing Frontend Development at Liferay Inc.

## Guideline development

We don't have a formalized procedure for implementation changes, but informally, we expect most changes to evlove like this:

1.  Somebody submits a question (eg. an issue) or proposal (eg. could be an issue or PR).

    If it's a question, tag it with the "[question](https://github.com/liferay/liferay-frontend-guidelines/labels/question)" label. If it's a proposal, tag it with "[rfc](https://github.com/liferay/liferay-frontend-guidelines/labels/rfc)" (which stands for "Request for comments").

2.  Over a period of some days, we arrive at (or draw near to) a consensus.
3.  After an interval that gives people adequate time to respond, we conclude the discussion; ultimately someone like [@jbalsas](https://github.com/jbalsas) will have the ability to make a call about what the conclusion should be (if it's not clear, or if there is some other reason to veto the consensus).

    Once a conclusion is reached, the proposal can be marked with the "[resolved](https://github.com/liferay/liferay-frontend-guidelines/labels/resolved)" label.

4.  PR documenting the guideline gets merged.
5.  If possible to enforce via automation, we add linting or other enforcement at the appropriate location (for example, via [eslint-config-liferay](https://github.com/liferay/eslint-config-liferay) or tooling that is specific to [liferay-portal](https://github.com/liferay)).
