#!/usr/bin/env node
require("dotenv").config();

const yargs = require("yargs");
const { Client } = require("pg");
const fs = require("fs");
const chalk = require("chalk");
const glob = require("glob");

process.stdin.on("end", function() {
  console.log("EOF");
});

const options = yargs
  .usage("Usage: $0 [options] <script> [args]")
  .string("d")
  .alias("d", "databaseUrl")
  .describe("d", "Specify the database url")
  .boolean("stdin")
  .describe("stdin", "Read the query from stdin")
  .boolean("s")
  .alias("s", "simulate")
  .describe("s", "Simulate the run without execuring queries")
  .boolean("q")
  .alias("q", "quiet")
  .describe("q", "Run quietly. Only output result of queries").argv;

let error = console.error;
if (options.quiet) {
  error = () => {};
}

let stdinQuery;
let scripts = [];
let argIndex = 0;

if (options.stdin) {
  try {
    stdinQuery = fs.readFileSync(process.stdin.fd, "utf8");
    scripts = ["STDIN"];
  } catch (e) {
    error(chalk.red("-- Error"), e.message);
    process.exit(1);
  }
}

if (!stdinQuery) {
  const scriptGlob = options._[0];
  if (!scriptGlob) {
    error(chalk.red("-- Error"), "No script specified");
    process.exit(1);
  }

  scripts = glob.sync(scriptGlob);
  if (scripts.length === 0) {
    error(chalk.red("-- No scripts match %s"), scriptGlob);
    process.exit(1);
  }
  scripts.sort();

  argIndex = 1;
}

const args = options._.slice(argIndex);
const dbUrl = options.databaseUrl || process.env.DATABASE_URL;

(async () => {
  const client = new Client({ connectionString: dbUrl });
  client.connect(err => {
    if (err) {
      error(chalk.red("-- Error"), err.message);
      process.exit(1);
    }
  });

  let counter = 0;
  for (const script of scripts) {
    error(chalk.green("-- Start %s"), script);

    try {
      if (!options.simulate) {
        let query;
        if (stdinQuery) {
          query = stdinQuery;
        } else {
          query = fs.readFileSync(script, "utf8");
        }

        const res = await client.query(query, args);
        if (res.rows) {
          console.log(JSON.stringify(res.rows, null, 2));
        }

        error(
          chalk.green("-- Finish"),
          script,
          `(${res.rowCount} ${res.rowCount === 1 ? "row" : "rows"})`
        );
      }
    } catch (err) {
      error(chalk.red("-- Error"), err.message);
      client.end();
      error(chalk.red("-- Exiting early due to error"));
      process.exit(1);
    }

    counter++;
  }

  client.end();
  error(chalk.green("-- Ran %s script%s"), counter, counter == 1 ? "" : "s");
})();
