# prettier-default-config

This is a small CLI tool that dumps all of prettier's default configuration
options to a file in the format of your choice.

## Installation

```
npm install -g prettier-default-config
```

## Usage

```
USAGE
    prettier-default-config [OPTIONS]

OPTIONS:
    --format <FORMAT> The config file format to generate.
                      <json|yaml|toml|js|package.json>
                      default: json

    --stdout          Write config to STDOUT rather than to a file

    --help            Prints help information
```

## License

MIT