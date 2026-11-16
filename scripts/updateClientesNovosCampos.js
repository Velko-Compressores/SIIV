// scripts/updateClientesNovosCampos.js

console.log("🚀 Atualizando tabela clientes...");

const db = require("../config/db");

const colunas = [
  "numero TEXT",
  "emailEmpresa1 TEXT",
  "emailEmpresa2 TEXT",
  "emailEmpresa3 TEXT"
];

let processadas = 0;

colunas.forEach(coluna => {

  db.run(
    `ALTER TABLE clientes ADD COLUMN ${coluna}`,
    err => {

      if (err) {

        if (err.message.includes("duplicate column name")) {
          console.log(`⚠️ Coluna já existe: ${coluna}`);
        } else {
          console.error(`❌ Erro ao criar ${coluna}:`, err.message);
        }

      } else {

        console.log(`✅ Coluna criada: ${coluna}`);

      }

      processadas++;

      if (processadas === colunas.length) {

        db.all(
          "PRAGMA table_info(clientes)",
          [],
          (err, rows) => {

            if (err) {
              console.error(err);
              process.exit(1);
            }

            console.log("\n📋 Estrutura atual da tabela clientes:\n");

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

    }
  );

});