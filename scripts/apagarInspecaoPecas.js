// apagarInspecaoPecas.js

const db = require("../config/db");

db.serialize(() => {

  db.run(
    "DROP TABLE IF EXISTS inspecaoPecas",
    (err) => {

      if (err) {

        console.error(
          "❌ Erro ao apagar tabela inspecaoPecas:",
          err.message
        );

      } else {

        console.log(
          "✅ Tabela inspecaoPecas apagada com sucesso"
        );

      }

      db.close(() => {

        console.log(
          "🔒 Conexão com banco fechada"
        );

      });

    }
  );

});