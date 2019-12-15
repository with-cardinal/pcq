# pcq

PostgreSQL Console Query

## Usage

```sh
pcq [options] <script.sql> [args...]
```

pcq relies on the `DATABASE_URL` environment variable for connecting to
PostgreSQL. It will load a .env file if one is defined in the current directory.
The format of `DATABASE_URL` is determined by
[pg-connection-string](https://github.com/iceddev/pg-connection-string).

Arguments to the query are specified as `$1`, `$2` in your script.

## Options

- `-d`, `--databaseUrl`: Specify the database url. Database url can also be specified by the `DATABASE_URL` environment variable.

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

## License

MIT. See LICENSE for more information.
