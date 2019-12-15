# pcq

PostgreSQL Console Query

## Usage

```sh
pcq <script.sql> [args...]
```

pcq relies on the `DATABASE_URL` environment variable for connecting to
PostgreSQL. It will load a .env file if one is defined in the current directory.
The format of `DATABASE_URL` is determined by
[pg-connection-string](https://github.com/iceddev/pg-connection-string).

Arguments to the query are specified as `$1`, `$2` in your script.

## Example Invocation

```sql
SELECT * FROM users WHERE id = $1;
```

```sh
$ pcq 80ea2e0a-af98-4ba0-813f-abb49563ab48
[
  {
    "username": "alan",
    "createdAt": "2019-12-10T13:57:08.495Z"
  }
]
```

## License

MIT. See LICENSE for more information.
