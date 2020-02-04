const fs = require('fs');
const test = require('tape');
const TOML = require('toml');
const YAML = require('yaml');

const { defaultConfig, formats } = require('.');

test('generate JSON', t => {
  t.plan(1);
  const result = formats.json.generate();
  t.deepEqual(JSON.parse(result), defaultConfig);
});

test('generate TOML', t => {
  t.plan(1);
  const result = formats.toml.generate();
  t.deepEqual(TOML.parse(result), defaultConfig);
});

test('generate YAML', t => {
  t.plan(1);
  const result = formats.yaml.generate();
  t.deepEqual(YAML.parse(result), defaultConfig);
});

test('generate JS', t => {
  t.plan(1);
  const result = formats.js.generate();
  t.deepEqual(eval(result), defaultConfig);
});

test('generate package.json', t => {
  t.plan(1);
  const before = JSON.parse(fs.readFileSync('package.json'));
  const result = formats['package.json'].generate();
  before.prettier = defaultConfig;
  t.deepEqual(JSON.parse(result), before);
});
