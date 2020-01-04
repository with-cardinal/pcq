# pcq

![NPM](https://img.shields.io/npm/v/pcq?style=for-the-badge) 
![Build Status](https://img.shields.io/github/workflow/status/with-cardinal/pcq/CI?style=for-the-badge)

**P**ostgreSQL **C**onsole **Q**uery

## Usage

```sh
pcq [options] <script.sql> [args...]
```

pcq relies on the `DATABASE_URL` environment variable for connecting to
PostgreSQL. It will load a .env file if one is defined in the current directory.
The format of `DATABASE_URL` is determined by
[pg-connection-string](https://github.com/iceddev/pg-connection-string).

The script can be a single script, or a set of scripts specified by a glob
pattern. You can also input a single script as standard input.

Arguments to the query are specified as `$1`, `$2` in your script. The same
arguments are applied to all scripts when more than one script is run in a
single invocation.

## Options

- `-d`, `--databaseUrl`: Specify the database url. Database url can also be
  specified by the `DATABASE_URL` environment variable.
- `-s`, `--simulate`: Simulate the execution without actually running any
  queries. Helpful for testing commands.
- `-q`, `--quiet`: Only output query results. No errors or status updates are
  output.

## Example Invocation

With a script of:

```sql
SELECT * FROM users WHERE id = $1;
```

You can run:

```sh
pcq script.sql 80ea2e0a-af98-4ba0-813f-abb49563ab48
```

And will get output like:

```json
[
  {
    "username": "alan",
    "createdAt": "2019-12-10T13:57:08.495Z"
  }
]
```

You could also use a glob to match all sql files in the current directory with:

```sh
pcq *.sql
```

Or you could redirect some text into PCQ:

```sh
echo "SELECT * FROM users WHERE id = 11" | pcq
```

Variable substitution can get a little tricky when redirecting, so be sure to check your shell's documentation for appropriate escape sequences.

## Common Uses

PCQ is a simple, flexible tool, with lots of practical uses. You can find documentation for our uses for it on [the Wiki](https://github.com/with-cardinal/pcq/wiki).

## License

MIT. See LICENSE for more information.
