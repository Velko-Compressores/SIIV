const db = require("../config/db");

db.run(
  "ALTER TABLE clientes ADD COLUMN liberadoPor TEXT",
  (err) => {
    if (err) {
      console.log("⚠️ Já existe:", err.message);
    } else {
      console.log("✅ Coluna criada");
    }
    process.exit();
  }
);

