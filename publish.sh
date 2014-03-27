#!/bin/sh

BRANCH=`git rev-parse --abbrev-ref HEAD`

if [ $BRANCH != master ]; then
  echo "only publish from the master branch. exiting."
  exit 1
fi

cake site

if [ $? != 0 ]; then
  echo "site building failed. exiting."
  exit 1
fi

UNCOMMITED_CHANGES=`git status --short`

if [ $UNCOMMITED_CHANGES != '' ]; then
  echo "you have uncommited changes. exiting."
  exit 1
fi

git checkout -b gh-pages
cp -rf site-dist/* .
git add --all .
git commit -m 'updating site'
