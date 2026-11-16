const db = require("../config/db");

[
  "foto1",
  "foto2",
  "foto3",
  "foto4",
  "foto5",
  "foto6"
].forEach(coluna => {

  db.run(
    `ALTER TABLE recebimentos ADD COLUMN ${coluna} TEXT`,
    (err) => {

      if (err) {
        console.log(
          `${coluna}: ${err.message}`
        );
      } else {
        console.log(
          `✅ Coluna ${coluna} criada`
        );
      }

    }
  );

});