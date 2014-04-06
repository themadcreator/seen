#!/bin/sh

cake build site
exec node -- ./node_modules/.bin/coffee ./site/index.coffee