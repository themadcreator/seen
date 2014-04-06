seen     = require '../../dist/latest/seen'
{assert} = require 'chai'

EPS = 1e-6

describe 'math tests', ->
  it 'can translate a point', ->
    matrix = seen.M()
    matrix.translate(0,10,0)

    point = seen.P()
    point.transform(matrix)

    assert.closeTo(point.x,  0, EPS)
    assert.closeTo(point.y, 10, EPS)
    assert.closeTo(point.z,  0, EPS)

    matrix = seen.M()
    matrix.translate(0,10,0)
    matrix.translate(0,-10,0)
    matrix.translate(5,0,0)
    matrix.translate(0,0,-1)

    point = seen.P()
    point.transform(matrix)

    assert.closeTo(point.x,  5, EPS)
    assert.closeTo(point.y,  0, EPS)
    assert.closeTo(point.z, -1, EPS)

  it 'can rotate a point', ->
    matrix = seen.M()
    matrix.roty(Math.PI)

    point = seen.P(1,0,0)
    point.transform(matrix)

    assert.closeTo(point.x, -1, EPS)
    assert.closeTo(point.y,  0, EPS)
    assert.closeTo(point.z,  0, EPS)

    matrix = seen.M()
    matrix.roty(Math.PI)
    point.transform(matrix)

    assert.closeTo(point.x,  1, EPS)
    assert.closeTo(point.y,  0, EPS)
    assert.closeTo(point.z,  0, EPS)

    matrix = seen.M()
    matrix.rotz(Math.PI/2)
    point.transform(matrix)

    assert.closeTo(point.x,  0, EPS)
    assert.closeTo(point.y,  1, EPS)
    assert.closeTo(point.z,  0, EPS)

  it 'can rotate a point around another point', ->
    matrix = seen.M()
    matrix.translate(0,-1,0)
    matrix.roty(Math.PI)
    matrix.translate(0, 1,0)

    point = seen.P(1,1,0)
    point.transform(matrix)

    assert.closeTo(point.x, -1, EPS)
    assert.closeTo(point.y,  1, EPS)
    assert.closeTo(point.z,  0, EPS)

  it 'can scale a point', ->
    matrix = seen.M()
    matrix.scale(1,10,0)

    point = seen.P(1,1,1)
    point.transform(matrix)

    assert.closeTo(point.x,  1, EPS)
    assert.closeTo(point.y, 10, EPS)
    assert.closeTo(point.z,  0, EPS)

  it 'can scale a point around another point', ->
    matrix = seen.M()
    matrix.translate(0,-3,0)
    matrix.scale(10,10,10)

    point = seen.P(1,1,1)
    point.transform(matrix)

    assert.closeTo(point.x,  10, EPS)
    assert.closeTo(point.y, -20, EPS)
    assert.closeTo(point.z,  10, EPS)

    point = seen.P(2,3,4)
    point.transform(matrix)

    assert.closeTo(point.x, 20, EPS)
    assert.closeTo(point.y,  0, EPS)
    assert.closeTo(point.z, 40, EPS)
