// scripts/updateClientes.js

console.log("🚀 Iniciando atualização da tabela clientes...");

const db = require("../config/db");

const colunas = [
  "responsavel1 TEXT",
  "telefoneResponsavel1 TEXT",
  "emailResponsavel1 TEXT",

  "responsavel2 TEXT",
  "telefoneResponsavel2 TEXT",
  "emailResponsavel2 TEXT"
];

let processadas = 0;

colunas.forEach(coluna => {

  db.run(
    `ALTER TABLE clientes ADD COLUMN ${coluna}`,
    (err) => {

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

      // Quando terminar todas
      if (processadas === colunas.length) {

        console.log("\n✅ Atualização finalizada.");

        db.all(
          "PRAGMA table_info(clientes)",
          [],
          (err, rows) => {

            if (err) {
              console.error(err);
              process.exit(1);
            }

            console.log("\n📋 Colunas atuais da tabela clientes:\n");

            rows.forEach(c => {
              console.log("-", c.name);
            });

            db.close(() => {
              process.exit(0);
            });

          }
        );

      }

    }
  );

});