/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import * as seen from "../../src-ts";
import { assert } from "chai";

describe('model tests', function() {
  it('can create a model', function() {
    let model;
    return model = new seen.Model();
  });

  it('can create a default model', function() {
    const model = seen.Models.default();
    return assert.equal(3, model.lights.length);
  });

  it('can add and remove a sub model', function() {
    const model = new seen.Model();
    assert.equal(0, model.children.length);

    const child = model.append();
    assert.equal(1, model.children.length);
    assert.equal(0, child.children.length);

    model.remove(child);
    return assert.equal(0, model.children.length);
  });

  it('can add and remove a shape', function() {
    const model = new seen.Model();
    assert.equal(0, model.children.length);

    const shape = seen.Shapes.cube();
    model.add(shape);
    assert.equal(1, model.children.length);
    model.remove(shape);
    return assert.equal(0, model.children.length);
  });

  return it('can add and remove a light', function() {
    const model = new seen.Model();
    assert.equal(0, model.lights.length);

    const light = seen.Lights.point();
    model.add(light);
    assert.equal(1, model.lights.length);
    model.remove(light);
    return assert.equal(0, model.lights.length);
  });
});
