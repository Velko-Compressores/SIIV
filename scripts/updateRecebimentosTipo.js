// scripts/updateRecebimentosTipo.js

console.log("🚀 Atualizando tabela recebimentos...");

const db = require("../config/db");

db.run(
  `ALTER TABLE recebimentos ADD COLUMN tipo TEXT`,
  err => {

    if (err) {

      if (err.message.includes("duplicate column name")) {
        console.log("⚠️ Coluna já existe: tipo");
      } else {
        console.error("❌ Erro ao criar coluna:", err.message);
      }

    } else {

      console.log("✅ Coluna criada: tipo");

    }

    db.all(
      "PRAGMA table_info(recebimentos)",
      [],
      (err, rows) => {

        if (err) {
          console.error(err);
          process.exit(1);
        }

        console.log("\n📋 Estrutura atual da tabela recebimentos:\n");

        rows.forEach(c => {
          console.log("-", c.name);
        });

        db.close(() => {
          console.log("\n✅ Atualização concluída.");
          process.exit(0);
        });

      }
    );

  }
);
