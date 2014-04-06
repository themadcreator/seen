#!/bin/sh

# Rebuild library and site
cake build site

# We must use exec here so that signals can propagate to the web server.
# Otherwise, the ports will not close and the restart will fail with
# EADDRINUSE
exec coffee ./site/index.coffee