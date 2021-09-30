#!/bin/bash
#
# SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
# SPDX-License-Identifier: MIT

# Usage:
#
#   bash filter-tags.sh $BRANCH $FILTER
#
# Example:
#
#   bash filter-tags.sh \
#     eslint-plugin-liferay/master \
#     'sed "s#^v#eslint-plugin-liferay/v#"'

set -e

if [ $# -ne 2 ]; then
  echo "error: expected 2 arguments: branch filter"
  exit 1
fi

branch="$1"
filter="$2"

git for-each-ref --format='%(objectname) %(objecttype) %(refname)' refs/tags |
  while read objectname objecttype refname; do
    refname="${refname#refs/tags/}"

    if [ "$objecttype" != "tag" ]; then
      continue
    fi

    commit="$(git rev-parse -q "$objectname"^{commit})" || continue

    git merge-base --is-ancestor "$commit" "$branch" || continue

    new_refname="$(echo "$refname" | eval "$filter")"

    if [ "$new_refname" = "$refname" ]; then
      continue
    fi

    new_objectname=$(( \
      echo "object $commit"
      echo "type commit"
      echo "tag $new_refname"
      git cat-file tag "$refname" |
        sed -n \
            -e '1,/^$/ {
                /^object /d
                /^type /d
                /^tag /d
              } ' \
            -e p \
      ) | git hash-object -t tag -w --stdin)
    git update-ref "refs/tags/$new_refname" "$new_objectname"
    git tag -d "$refname"
  done
