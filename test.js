const fs = require('fs');
const test = require('tape');
const TOML = require('@iarna/toml');
const YAML = require('yaml');

const { defaultConfigFor, formats } = require('.');

test('generate JSON', t => {
  t.plan(1);
  const result = formats.json.generate();
  t.deepEqual(JSON.parse(result), defaultConfigFor('json'));
});

test('generate TOML', t => {
  t.plan(1);
  const result = formats.toml.generate();
  t.deepEqual(TOML.parse(result), defaultConfigFor('toml'));
});

test('generate YAML', t => {
  t.plan(1);
  const result = formats.yaml.generate();
  t.deepEqual(YAML.parse(result), defaultConfigFor('yaml'));
});

test('generate JS', t => {
  t.plan(1);
  const result = formats.js.generate();
  t.deepEqual(eval(result), defaultConfigFor('js'));
});

test('generate package.json', t => {
  t.plan(1);
  const before = JSON.parse(fs.readFileSync('package.json'));
  const result = formats['package.json'].generate();
  before.prettier = defaultConfigFor('package.json');
  t.deepEqual(JSON.parse(result), before);
});

test('YAML supports infinity, leave rangeEnd in', t => {
  t.plan(1);
  const result = formats.yaml.generate();
  t.equal(YAML.parse(result).rangeEnd, Infinity);
});

test('TOML supports infinity, leave rangeEnd in', t => {
  t.plan(2);
  const result = TOML.parse(formats.toml.generate());
  t.true(Object.keys(result).includes('rangeEnd'));
  t.equal(result.rangeEnd, Infinity);
});

test("JSON doesn't support undefined, leave out filepath and parser", t => {
  t.plan(2);
  const result = JSON.parse(formats.json.generate());
  t.false(Object.keys(result).includes('parser'));
  t.false(Object.keys(result).includes('filepath'));
});

test("YAML doesn't support undefined, leave out filepath and parser", t => {
  t.plan(2);
  const result = YAML.parse(formats.yaml.generate());
  t.false(Object.keys(result).includes('parser'));
  t.false(Object.keys(result).includes('filepath'));
});

test('JS supports undefined, leave in parser and filepath', t => {
  t.plan(4);
  const result = eval(formats.js.generate());
  t.equal(result.parser, undefined);
  t.equal(result.filepath, undefined);
  t.true(Object.keys(result).includes('parser'));
  t.true(Object.keys(result).includes('filepath'));
});
