// apagarComercial.js

const db = require("../config/db");

db.serialize(() => {

  db.run(
    "DROP TABLE IF EXISTS comercial",
    (err) => {

      if (err) {
        console.error(
          "❌ Erro ao apagar tabela comercial:",
          err.message
        );
      } else {
        console.log(
          "✅ Tabela comercial apagada com sucesso"
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