# Releasing

1.   Run the changelog generator with `--prepatch` or similar:

     ```
     ../../../projects/npm-tools/packages/changelog-generator/bin/liferay-changelog-generator.js --prepatch
     ```

2.   Publish using `yarn publish --prepatch` (or similar).

3.   Push to monorepo:

     ```
     git push upstream --follow-tags --dry-run
     git push upstream --follow-tags
     ```

4.   Copy release notes from CHANGELOG.md to [the releases page](https://github.com/liferay/liferay-frontend-projects/releases).
