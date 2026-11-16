// apagarInspecoes.js

const db = require("../config/db");

db.serialize(() => {

  db.run(
    "DROP TABLE IF EXISTS inspecoes",
    (err) => {

      if (err) {
        console.error(
          "❌ Erro ao apagar tabela inspecoes:",
          err.message
        );
      } else {
        console.log(
          "✅ Tabela inspecoes apagada com sucesso"
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