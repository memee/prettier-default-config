#!/usr/bin/env node

const fs = require('fs');
const minimist = require('minimist');
const path = require('path');
const prettier = require('prettier');

const defaultConfigFor = function(format) {
  let config = prettier.getSupportInfo().options;

  if (!['js', 'yaml'].includes(format)) {
    config = config.filter(
      option => ![null, Infinity].includes(option.default)
    );
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
      return Object.entries(defaultConfigFor('yaml'))
        .map(([key, value]) => {
          if (typeof value === 'string' && value === '') return `${key}: ''`;
          if (value === null) return `${key}: ~`;
          if (value === Infinity) return `${key}: .inf`;
          if (!!value.forEach && value.length === 0) return `${key}: []`;
          return `${key}: ${value}`;
        })
        .join('\n');
    },
  },
  toml: {
    filename: '.prettierrc.toml',
    generate: function() {
      return Object.entries(defaultConfigFor('toml'))
        .map(([key, value]) => {
          if (typeof value === 'string') return `${key} = "${value}"`;
          if (!!value.forEach && value.length === 0) return `${key} = []`;
          return `${key} = ${value}`;
        })
        .join('\n');
    },
  },
  js: {
    filename: '.prettierrc.js',
    generate: function() {
      const contents = Object.entries(defaultConfigFor('js'))
        .map(([key, value]) => {
          if (typeof value === 'string') return `  ${key}: '${value}',`;
          if (typeof value === 'undefined') return `  ${key}: undefined,`;
          if (value === null) return `  ${key}: null,`;
          if (!!value.forEach && value.length === 0) return `${key}: [],`;
          return `  ${key}: ${value},`;
        })
        .join('\n');
      return `module.exports = {\n${contents}\n};`;
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
