/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const path         = require('path');
const childProcess = require('child_process');
const fs           = require('fs');
const phantomjs    = require('phantomjs');
const pngjs        = require('pngjs');
const {assert}     = require('chai');
const Q            = require('q');

const TAG_TYPES = [
  'svg',
  'canvas'
];

const RENDERS = [
  'lights-ambient',
  'lights-directional',
  'lights-point',
  'materials-metallic',
  'materials-opacity',
  'materials-specular',
  'materials-stroke',
  'shaders-ambient',
  'shaders-diffuse',
  'shaders-flat',
  'shaders-phong',
  'shapes-cube',
  'shapes-icosahedron-0',
  'shapes-icosahedron-1',
  'shapes-icosahedron-2',
  'shapes-icosahedron-3',
  'shapes-icosahedron-4',
  //'shapes-text-0'
  'shapes-patch',
  'shapes-tetrahedon'
];

const compareRenders = function(pathCanonical, pathTest, done) {
  const promises = [pathCanonical, pathTest].map(function(pathPng) {
    const defer = Q.defer();
    fs.createReadStream(pathPng)
      .pipe(new pngjs.PNG({filterType : 4}))
      .on('parsed', function() { return defer.resolve(this); });
    return defer.promise;
  });

  return Q.all(promises)
  .spread(function(pngCanonical, pngTest) {
    // Sadly, we can't just compare the buffers with deepEquals because mocha stalls
    assert.equal(pngCanonical.data.length, pngTest.data.length);
    for (let i = 0, end = pngCanonical.data.length, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
      assert.equal(pngCanonical.data[i], pngTest.data[i]);
    }
  })
  .done(done);
};

describe('render smoke test', function() {
  it('renders test scenes without errors', function(done) {
    const testPath = path.join(__dirname, '..', 'phantom', 'render-scenes.coffee');
    return childProcess.execFile(phantomjs.path, [testPath], function(err, stdout, stderr) {
      assert.propertyVal(stdout, 'length', 0);
      assert.propertyVal(stderr, 'length', 0);
      return done(err);
    });
  });

  describe('rendered all test scenes', () =>
    TAG_TYPES.forEach(tagType =>
      RENDERS.forEach(render =>
        it(`rendered ${tagType} ${render}`, () => assert(fs.existsSync(path.join(__dirname, '..', 'phantom', 'renders', `${tagType}-${render}.png`))))
      )
    )
  );

  return describe('all renders match canonical renders', () =>
    TAG_TYPES.forEach(tagType =>
      RENDERS.forEach(render =>
        it(`rendered ${tagType} ${render} matches canonical`, done =>
          compareRenders(
            path.join(__dirname, '..', 'phantom', 'canonical', `${tagType}-${render}.png`),
            path.join(__dirname, '..', 'phantom', 'renders', `${tagType}-${render}.png`),
            done
          )
        )
      )
    )
  );
});
