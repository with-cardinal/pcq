#!/usr/bin/env node
require("dotenv").config();

const yargs = require("yargs");
const { Client } = require("pg");
const fs = require("fs");
const chalk = require("chalk");
const glob = require("glob");

const options = yargs
  .usage("Usage: $0 [options] <script> [args]")
  .demandCommand(1)
  .string("d")
  .alias("d", "databaseUrl")
  .describe("d", "Specify the database url").argv;

const scriptGlob = options._[0];
const args = options._.slice(1);
const dbUrl = options.databaseUrl || process.env.DATABASE_URL;

const scripts = glob.sync(scriptGlob);
if (scripts.length === 0) {
  console.error(chalk.red("-- No scripts match %s"), scriptGlob);
  process.exit(1);
}
scripts.sort();

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  client.connect(err => {
    if (err) {
      console.error(chalk.red("-- Error"), err.message);
      process.exit(1);
    }
  });

  let counter = 0;
  for (const script of scripts) {
    console.error(chalk.green("-- Start %s"), script);

    try {
      const query = fs.readFileSync(script, "utf8");
      const res = await client.query(query, args);

      if (res.rows) {
        console.log(JSON.stringify(res.rows, null, 2));
      }
      console.error(chalk.green("-- Finish"), script);
    } catch (err) {
      console.error(chalk.red("-- Error"), err.message);
      client.end();
      console.error(chalk.red("-- Exiting early due to error"));
      process.exit(1);
    }

    counter++;
  }

  client.end();
  console.error(
    chalk.green("-- Ran %s script%s"),
    counter,
    counter == 1 ? "" : "s"
  );
})();
