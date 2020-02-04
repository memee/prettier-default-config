#!/usr/bin/env node

const fs = require('fs');
const minimist = require('minimist');
const path = require('path');

const defaultConfig = {
  arrowParens: 'avoid',
  bracketSpacing: true,
  endOfLine: 'auto',
  filepath: '',
  htmlWhitespaceSensitivity: 'css',
  insertPragma: false,
  jsxBracketSameLine: false,
  jsxSingleQuote: false,
  parser: '',
  printWidth: 80,
  proseWrap: 'preserve',
  quoteProps: 'as-needed',
  requirePragma: false,
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: 'none',
  useTabs: false,
  vueIndentScriptAndStyle: false,
};

const formats = {
  json: {
    filename: '.prettierrc',
    generate: function() {
      return JSON.stringify(defaultConfig, null, 2);
    },
  },
  yaml: {
    filename: '.prettierrc.yaml',
    generate: function() {
      return Object.entries(defaultConfig)
        .map(([key, value]) => {
          if (typeof value === 'string' && value === '') return `${key}: ''`;
          return `${key}: ${value}`;
        })
        .join('\n');
    },
  },
  toml: {
    filename: '.prettierrc.toml',
    generate: function() {
      return Object.entries(defaultConfig)
        .map(([key, value]) => {
          if (typeof value === 'string') return `${key} = "${value}"`;
          return `${key} = ${value}`;
        })
        .join('\n');
    },
  },
  js: {
    filename: '.prettierrc.js',
    generate: function() {
      const contents = Object.entries(defaultConfig)
        .map(([key, value]) => {
          if (typeof value === 'string') return `  ${key}: '${value}',`;
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
      data.prettier = defaultConfig;
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
  defaultConfig,
  formats,
};

if (require.main === module) {
  run();
}
