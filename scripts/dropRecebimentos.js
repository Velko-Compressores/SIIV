// scripts/dropRecebimentos.js

const db = require("../config/db");
db.serialize(() => {
  db.run(
    "DROP TABLE IF EXISTS recebimentos",
    (err) => {
      if (err) {
        console.error(
          "❌ Erro ao apagar tabela recebimentos:",
          err.message
        );
      } else {
        console.log(
          "✅ Tabela recebimentos apagada com sucesso"
        );
      }
      db.close(() => {
        console.log("🔒 Conexão com banco fechada");
      });
    }
  );

});