const db = require("../config/db");

// ✅ NOME FANTASIA
db.run(
  "ALTER TABLE clientes ADD COLUMN nomeFantasia TEXT",
  (err) => {
    if (err) {
      console.error("Erro nomeFantasia:", err.message);
    } else {
      console.log("✅ Coluna nomeFantasia criada");
    }
  }
);
