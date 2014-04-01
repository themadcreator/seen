
getBrowserAudioContext = ->
  CONTEXT_INTERFACES = [
    'AudioContext'
    'webkitAudioContext'
    'mozAudioContext'
    'oAudioContext'
    'msAudioContext'
  ]
  for name in CONTEXT_INTERFACES
    if window[name]? then return new window[name]
  return null

getContextWhenReady = (audio, callback) ->
  doPlay = ->
    callback(getBrowserAudioContext())
  
  onCanPlay = ->
    # Timeout hack for chrome
    setTimeout(doPlay, 20)

  if(audio.readyState < 3) then audio.addEventListener('canplay', onCanPlay) else onCanPlay()
    

(this ? exports).getContextWhenReady = getContextWhenReady