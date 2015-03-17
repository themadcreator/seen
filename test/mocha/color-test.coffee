seen     = require '../../dist/latest/seen'
{assert} = require 'chai'

assertColorsMatch = (c0, c1) ->
  assert.ok(c0)
  assert.ok(c1)
  assert.equal(c0.r, c1.r)
  assert.equal(c0.g, c1.g)
  assert.equal(c0.b, c1.b)
  assert.equal(c0.a, c1.a)

describe 'color tests', ->
  it 'can create colors', ->
    c = seen.C(0,0,0)
    assert.ok(c)

  it 'can parse hex strings', ->
    c0 = seen.Colors.hex('#FF00FF')
    c1 = seen.Colors.parse('#FF00FF')
    assertColorsMatch(c0, c1)

  it 'can parse rgb strings', ->
    c0 = seen.Colors.rgb(0xFF, 0, 0xFF)
    c1 = seen.Colors.parse('rgb(255,0,255)')
    assertColorsMatch(c0, c1)

  it 'can parse rgba strings', ->
    c0 = seen.Colors.rgb(0xFF, 0, 0xFF, 0x80)
    c1 = seen.Colors.parse('rgba(255,0,255,0.5)')
    assertColorsMatch(c0, c1)

  it 'can default to black if it can\'t parse', ->
    c0 = seen.Colors.black()
    c1 = seen.Colors.parse('jabba the babba')
    assertColorsMatch(c0, c1)
