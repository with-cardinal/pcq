#!/usr/bin/env node
require("dotenv").config();

const yargs = require("yargs");
const { Client } = require("pg");
const fs = require("fs");
const chalk = require("chalk");

process.stdin.on("end", function () {
  console.log("EOF");
});

const options = yargs
  .usage("Usage: $0 <scripts> [options]")
  .string("d")
  .alias("d", "databaseUrl")
  .describe("d", "Specify the database url")
  .boolean("stdin")
  .describe("stdin", "Read the query from stdin")
  .array("a")
  .alias("a", "arg")
  .describe("a", "Specify arguments")
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
let scripts = options._;

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
  if (scripts.length === 0) {
    error(chalk.red("-- Error"), "No script specified");
    process.exit(1);
  }

  scripts.sort();
}

const dbUrl = options.databaseUrl || process.env.DATABASE_URL;

(async () => {
  const client = new Client({ connectionString: dbUrl });
  client.connect((err) => {
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

        const res = await client.query(query, options.arg);
        if (res.rows) {
          console.log(JSON.stringify(res.rows, null, 2));
        }

        let rowMsg = "";
        if (res.rowCount) {
          rowMsg = `(${res.rowCount} ${res.rowCount === 1 ? "row" : "rows"})`;
        }
        error(chalk.green("-- Finish"), script, rowMsg);
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
