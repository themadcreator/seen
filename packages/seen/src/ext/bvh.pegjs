
/*----------------------------------------------

  Biovision BVH motion capture format

  License : Apache-2.0
  Author  : themadcreator@github

  To build parser:
  > npm install -g pegjs
  > pegjs bvh.pegjs bvh-parser.js

-----------------------------------------------*/

program
  = 'HIERARCHY'i _ root:root _ motion:motion
    { return {root:root, motion:motion} }

/*----------------------------------------------

  JOINT HIERARCHY

-----------------------------------------------*/

root
  = 'ROOT'i _ id:id _ '{' _ offset:offset _ channels:channels _ joints:joint* '}'
    { return {id:id, offset:offset, channels:channels, joints:joints}}

joint
  = 'JOINT'i _ id:id _ '{' _ offset:offset _ channels:channels _ joints:joint* '}' _
    { return {type:'JOINT', id:id, offset:offset, channels:channels, joints:joints} }
  / 'END SITE'i _ '{' _ offset:offset _ '}' _
    { return {type:'END SITE', offset:offset}}

offset
  = 'OFFSET'i _ x:float _ y:float _ z:float
    { return {x:x, y:y, z:z} }

channels
  = 'CHANNELS'i _ count:[0-9] _ channels:(channel_type*)
    { return channels }

channel_type
  = channel_type:(
    'Xposition'i /
    'Yposition'i /
    'Zposition'i /
    'Xrotation'i /
    'Yrotation'i /
    'Zrotation'i
    ) _
    { return channel_type }

/*----------------------------------------------

  MOTION DATA FRAMES

-----------------------------------------------*/

motion
  = 'MOTION'i _ 'Frames:'i _ frameCount:integer _ 'Frame Time:'i _ frameTime:float _ frames:frame_data*
    { return {frameCount:frameCount, frameTime:frameTime, frames:frames} }

frame_data
  = frameValues:(frame_value+) [\n\r]+
    { return frameValues }

frame_value
  = value:float [ ]*
    { return value }

/*----------------------------------------------

  VALUE TYPES

-----------------------------------------------*/

id
  = $([a-zA-Z0-9-_]+)

float
  = value:[-0-9.e]+
    { return parseFloat(value.join('')) }

integer
  = value:[-0-9e]+
    { return parseInt(value.join('')) }
_
  = [ \t\n\r]*
    { return undefined }
