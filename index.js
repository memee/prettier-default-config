#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { inspect } = require('util');

const minimist = require('minimist');
const prettier = require('prettier');
const TOML = require('@iarna/toml');
const YAML = require('yaml');

const defaultConfigFor = function(format) {
  let config = prettier.getSupportInfo().options;

  if (format.match(/json/)) {
    config = config.filter(option => option.default !== Infinity);
  }

  if (format != 'js') {
    config = config.filter(option => option.default !== undefined);
  }

  return Object.fromEntries(
    config.map(option => [option.name, option.default])
  );
};

const formats = {
  json: {
    filename: '.prettierrc',
    generate: function() {
      return JSON.stringify(defaultConfigFor('json'), null, 2);
    },
  },
  yaml: {
    filename: '.prettierrc.yaml',
    generate: function() {
      return YAML.stringify(defaultConfigFor('yaml'));
    },
  },
  toml: {
    filename: '.prettierrc.toml',
    generate: function() {
      return TOML.stringify(defaultConfigFor('toml'));
    },
  },
  js: {
    filename: '.prettierrc.js',
    generate: function() {
      return `module.exports = ${inspect(defaultConfigFor('js'))};`;
    },
  },
  'package.json': {
    filename: 'package.json',
    generate: function() {
      const file = path.resolve('package.json');
      if (!fs.existsSync(file)) {
        console.error(
          'Error: no package.json file found in the current directory'
        );
        process.exit(0);
      }
      const data = JSON.parse(fs.readFileSync(file));
      data.prettier = defaultConfigFor('json');
      return JSON.stringify(data, null, 2);
    },
  },
};

function writeToFile(filename, data) {
  fs.writeFile(path.resolve(filename), `${data}\n`, {}, () => {
    console.log(`Wrote default config to ${filename}`);
    process.exit(0);
  });
}

function writeToStdout(data) {
  process.stdout.write(`${data}\n`);
  process.exit(0);
}

function help(logger) {
  if (!logger) logger = console.log;

  const formatDisplay = Object.keys(formats).join('|');

  logger('USAGE:');
  logger('    prettier-default-config [OPTIONS]');
  logger();
  logger('OPTIONS:');
  logger('    --format <FORMAT> The config file format to generate.');
  logger(`                      <${formatDisplay}>`);
  logger('                      default: json');
  logger();
  logger('    --stdout          Write config to STDOUT rather than to a file');
  logger();
  logger('    --help            Prints help information');
  process.exit(0);
}

function run() {
  const args = minimist(process.argv);

  if (args.help) help();

  const format = formats[args.format ? args.format : 'json'];
  if (format) {
    const config = format.generate();

    if (args.stdout) {
      writeToStdout(config);
    } else {
      writeToFile(format.filename, config);
    }
  } else {
    console.error('Error: invalid format');
    console.error();
    help(console.error);
  }
}

module.exports = {
  defaultConfigFor,
  formats,
};

if (require.main === module) {
  run();
}
