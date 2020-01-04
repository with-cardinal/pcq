#!/usr/bin/env node
require("dotenv").config();

const yargs = require("yargs");
const { Client } = require("pg");
const fs = require("fs");
const chalk = require("chalk");
const glob = require("glob");

const options = yargs
  .usage("Usage: $0 [options] <script> [args]")
  .string("d")
  .alias("d", "databaseUrl")
  .describe("d", "Specify the database url")
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

try {
  stdinQuery = fs.readFileSync(0, "utf8");
  scripts = ["STDIN"];
} catch (e) {
  // ignore
}

if (!stdinQuery) {
  const scriptGlob = options._[0];
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
  const client = new Client({ connectionString: process.env.DATABASE_URL });
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
        error(chalk.green("-- Finish"), script);
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
