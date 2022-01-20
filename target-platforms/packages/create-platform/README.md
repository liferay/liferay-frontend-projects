# create-platform

This is just a brief explanation on where to find the Git tags needed for the
`create-platform` script to do its duties.

## Liferay Portal CE Tags

All CE tags can be found in
[the liferay-portal repo](https://github.com/liferay/liferay-portal).

They look like
[7.4.3.7-ga7](https://github.com/liferay/liferay-portal/tree/7.4.3.7-ga7), so
they are pretty straightforward.

To search for them, simply head up to
[the liferay-portal repo](https://github.com/liferay/liferay-portal) and use the
branch/tag selector to look for the desired tag.

## Liferay DXP Tags

The DXP tags can be found in
[the liferay-portal-ee repo](https://github.com/liferay/liferay-portal-ee).

They look different for versions prior to 7.4 and 7.4 and successive. The names
are like this:

-   For 7.3-:
    -   For initial release: [fix-pack-base-7310](https://github.com/liferay/liferay-portal-ee/tree/fix-pack-base-7310)
    -   For successive releases: [fix-pack-dxp-1-7310](https://github.com/liferay/liferay-portal-ee/tree/fix-pack-dxp-1-7310)
-   For 7.4+:
    -   For initial release: [7.4.13-ga1](https://github.com/liferay/liferay-portal-ee/tree/7.4.13-ga1)
    -   For successive releases: [7.4.13-u1](https://github.com/liferay/liferay-portal-ee/tree/7.4.13-u1)

For 7.3 we have an extra number after `dxp-`. That is the fixpack number so, for
instance, `dxp-1-7310` is fixpack `1` for `Liferay DXP 7.3.1.0`.

The 7.4 structure is similar to the one in CE but using `ga#` for the first
release of a major version series, and `-u#` for successive updates.

### GitHub Personal Access Tokens

For DXP versions, you will need to pass the `-ee` argument to the
`create-platform` script and provide a GitHub personal access token (PAT) in the
`CP_TOKEN` environment variable.

You can create a PAT in `Account > Settings > Developer settings > Personal Access Tokens`, following [this link](https://github.com/settings/tokens).
It needs to have `repo` read permissions, at least.

## Caveats

When using versions series `7.3` or older the script needs to be run providing a
local `liferay-portal` directory instead of a tag name.

This is because the bundler-imports were not centralized in the root
`npmscripts.config.js` file, thus the script cannot get the information it needs
accessing the repo using HTTP.

The good news is that from `7.4` everything can be retrieved via HTTP and
there's no need to clone `liferay-portal` or `liferay-portal-ee` to create or
update platforms.
