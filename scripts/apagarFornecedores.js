// apagarFornecedores.js

const db = require("../config/db");

db.serialize(() => {

  db.run(
    "DROP TABLE IF EXISTS fornecedores",
    (err) => {

      if (err) {
        console.error(
          "❌ Erro ao apagar tabela fornecedores:",
          err.message
        );
      } else {
        console.log(
          "✅ Tabela fornecedores apagada com sucesso"
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