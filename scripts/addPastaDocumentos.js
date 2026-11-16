// scripts/addPastaDocumentos.js

console.log("🚀 Adicionando coluna pastaDocumentos...");

const db = require("../config/db");

db.run(
  `ALTER TABLE clientes ADD COLUMN pastaDocumentos TEXT`,
  (err) => {

    if (err) {

      if (err.message.includes("duplicate column name")) {

        console.log("⚠️ Coluna pastaDocumentos já existe");

      } else {

        console.error("❌ Erro:", err.message);

      }

    } else {

      console.log("✅ Coluna pastaDocumentos criada");

    }

    db.all(
      "PRAGMA table_info(clientes)",
      [],
      (err, rows) => {

        if (err) {
          console.error(err);
          process.exit(1);
        }

        console.log("\n📋 Estrutura atual da tabela clientes:\n");

        rows.forEach(coluna => {
          console.log("-", coluna.name);
        });

        db.close(() => {
          process.exit(0);
        });

      }
    );

  }
);