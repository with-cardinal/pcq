#!/usr/bin/env node
require("dotenv").config();

const yargs = require("yargs");
const { Client } = require("pg");
const fs = require("fs");

const options = yargs
  .usage("Usage: $0 [options] <script> [args]")
  .demandCommand(1)
  .string("d")
  .alias("d", "databaseUrl")
  .describe("d", "Specify the database url").argv;

const script = options._[0];
const args = options._.slice(1);
const dbUrl = options.databaseUrl || process.env.DATABASE_URL;

const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect(err => {
  if (err) {
    console.error("Error", err.message);
    process.exit();
  }
});

try {
  var query = fs.readFileSync(script, "utf8");
} catch (err) {
  console.error("Error", err.message);
  process.exit(1);
}

client.query(query, args, (err, res) => {
  if (!err) {
    console.log(JSON.stringify(res.rows, null, 2));
  }
  client.end();

  if (err) {
    console.error("Error", err.message);
    process.exit(1);
  }
});
