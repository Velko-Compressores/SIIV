// scripts/updateClientesEnderecoReferencia.js

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

        if (err.message.includes("duplicate column")) {
          console.log(`⚠️ Já existe: ${coluna}`);
        } else {
          console.error(err.message);
        }

      } else {
        console.log(`✅ Criada: ${coluna}`);
      }

      processadas++;

      if (processadas === colunas.length) {

        console.log("✅ Atualização concluída");

        db.close(() => process.exit(0));

      }

    }
  );

});