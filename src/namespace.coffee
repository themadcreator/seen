# ## Init
# #### Module definition
# ------------------

# Declare and attach seen namespace
seen = {}
if window? then window.seen = seen # for the web
if module?.exports? then module.exports = seen # for node