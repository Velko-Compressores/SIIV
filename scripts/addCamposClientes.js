const db = require("../config/db");

db.run(
  "ALTER TABLE clientes ADD COLUMN alvara TEXT",
  (err) => {

    if (err) {
      console.log("⚠️ Coluna alvara:", err.message);
    } else {
      console.log("✅ Coluna alvara criada");
    }

    db.run(
      "ALTER TABLE clientes ADD COLUMN cartaoCnpj TEXT",
      (err) => {

        if (err) {
          console.log("⚠️ Coluna cartaoCnpj:", err.message);
        } else {
          console.log("✅ Coluna cartaoCnpj criada");
        }

        process.exit();
      }
    );

  }
);