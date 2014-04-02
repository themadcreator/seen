# ## Apache 2.0 License

#     Copyright 2013, 2014 github/themadcreator

#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at

#     http://www.apache.org/licenses/LICENSE-2.0

#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.

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