# prettier-default-config

This is a small CLI tool that dumps all of Prettier's default configuration
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

## Exclusions

The config file formats that Prettier uses are not able to represent all of
Prettier's default values. For instance, JSON can't represent `Infinity`, and
no format except actual JavaScript can represent `undefined`. As a result,
depending on the chosen format, some configuration options may be excluded. The
current list of exclusions is as follows:


| Format | Excluded Options                  |
|--------|-----------------------------------|
| JSON   | `rangeEnd` , `filepath`, `parser` |
| TOML   | `rangeEnd`                        |
| YAML   | `filepath`                        |

## License

MIT
