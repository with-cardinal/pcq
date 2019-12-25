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
  .describe("q", "Run quietly. Only output result of queries")
  .demandCommand(1).argv;

const scriptGlob = options._[0];
const args = options._.slice(1);
const dbUrl = options.databaseUrl || process.env.DATABASE_URL;

let error = console.error;
if (options.quiet) {
  error = () => {};
}

const scripts = glob.sync(scriptGlob);
if (scripts.length === 0) {
  error(chalk.red("-- No scripts match %s"), scriptGlob);
  process.exit(1);
}
scripts.sort();

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
        const query = fs.readFileSync(script, "utf8");
        const res = await client.query(query, args);

        if (res.rows) {
          console.log(JSON.stringify(res.rows, null, 2));
        }
      }
      error(chalk.green("-- Finish"), script);
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
