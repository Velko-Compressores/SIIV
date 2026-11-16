// scripts/versaoSqlite.js

const db = require("../config/db");

db.get(
  "SELECT sqlite_version() AS versao",
  [],
  (err, row) => {

    if (err) {
      console.error(err);
      return;
    }

    console.log("SQLite:", row.versao);

    db.close();
  }
);