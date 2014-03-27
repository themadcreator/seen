#!/bin/sh

BRANCH=`git rev-parse --abbrev-ref HEAD`

if [ $BRANCH != master ]; then
  echo "only publish from the master branch. exiting."
  exit 1
fi


if [ `cake site` != 0 ]; then
  echo "site building failed. exiting."
  exit 1
fi

