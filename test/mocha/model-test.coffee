seen     = require '../../dist/latest/seen'
{assert} = require 'chai'

describe 'model tests', ->
  it 'can create a model', ->
    model = new seen.Model()

  it 'can create a default model', ->
    model = seen.Models.default()
    assert.equal(3, model.lights.length)

  it 'can add and remove a sub model', ->
    model = new seen.Model()
    assert.equal(0, model.children.length)

    child = model.append()
    assert.equal(1, model.children.length)
    assert.equal(0, child.children.length)

    model.remove(child)
    assert.equal(0, model.children.length)

  it 'can add and remove a shape', ->
    model = new seen.Model()
    assert.equal(0, model.children.length)

    shape = seen.Shapes.cube()
    model.add(shape)
    assert.equal(1, model.children.length)
    model.remove(shape)
    assert.equal(0, model.children.length)

  it 'can add and remove a light', ->
    model = new seen.Model()
    assert.equal(0, model.lights.length)

    light = seen.Lights.point()
    model.add(light)
    assert.equal(1, model.lights.length)
    model.remove(light)
    assert.equal(0, model.lights.length)
