// apagarDesmontagens.js

const db = require("../config/db");

db.serialize(() => {

  db.run(
    "DROP TABLE IF EXISTS desmontagens",
    (err) => {

      if (err) {
        console.error(
          "❌ Erro ao apagar tabela desmontagens:",
          err.message
        );
      } else {
        console.log(
          "✅ Tabela desmontagens apagada com sucesso"
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