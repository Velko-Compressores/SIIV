const db = require("../config/db");

const colunas = [
  "responsavel",
  "telefoneResponsavel",
  "emailResponsavel",
  "liberadoPor"
];

let processadas = 0;

colunas.forEach(coluna => {

  db.run(
    `ALTER TABLE clientes DROP COLUMN ${coluna}`,
    (err) => {

      if (err) {
        console.error(`❌ Erro ao remover ${coluna}:`, err.message);
      } else {
        console.log(`✅ Coluna removida: ${coluna}`);
      }

      processadas++;

      if (processadas === colunas.length) {

        console.log("\n✅ Processo finalizado.");

        db.close(() => {
          process.exit(0);
        });

      }

    }
  );

});