
import * as seen from "../src";
import { assert } from "chai";

const assertColorsMatch = function(c0, c1) {
  assert.ok(c0);
  assert.ok(c1);
  assert.equal(c0.r, c1.r);
  assert.equal(c0.g, c1.g);
  assert.equal(c0.b, c1.b);
  return assert.equal(c0.a, c1.a);
};

describe('color tests', function() {
  it('can create colors', function() {
    const c = seen.C(0,0,0);
    return assert.ok(c);
  });

  it('can parse hex strings', function() {
    const c0 = seen.Colors.hex('#FF00FF');
    const c1 = seen.Colors.parse('#FF00FF');
    return assertColorsMatch(c0, c1);
  });

  it('can parse rgb strings', function() {
    const c0 = seen.Colors.rgb(0xFF, 0, 0xFF);
    const c1 = seen.Colors.parse('rgb(255,0,255)');
    return assertColorsMatch(c0, c1);
  });

  it('can parse rgba strings', function() {
    const c0 = seen.Colors.rgb(0xFF, 0, 0xFF, 0x80);
    const c1 = seen.Colors.parse('rgba(255,0,255,0.5)');
    return assertColorsMatch(c0, c1);
  });

  return it('can default to black if it can\'t parse', function() {
    const c0 = seen.Colors.black();
    const c1 = seen.Colors.parse('jabba the babba');
    return assertColorsMatch(c0, c1);
  });
});
