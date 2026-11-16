const db = require("../config/db");

db.serialize(() => {

  db.run("DROP TABLE IF EXISTS documentos", (err) => {
    if (err) {
      console.error("❌ Erro ao apagar tabela:", err.message);
    } else {
      console.log("✅ Tabela documentos apagada com sucesso");
    }
  });

  // ✅ fecha conexão
  db.close(() => {
    console.log("🔒 Conexão com banco fechada");
  });

});