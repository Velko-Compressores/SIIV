const db = require("../config/db");

db.serialize(() => {

  db.run("DROP TABLE IF EXISTS users", (err) => {
    if (err) {
      console.error(
        "❌ Erro ao apagar tabela users:",
        err.message
      );
    } else {
      console.log(
        "✅ Tabela users apagada com sucesso"
      );
    }
  });

  // ✅ fecha conexão
  db.close(() => {
    console.log(
      "🔒 Conexão com banco fechada"
    );
  });

});
