const db = require("../config/db");
db.serialize(() => {
  db.run("DROP TABLE IF EXISTS prestadores", (err) => {
    if (err) {
      console.error("❌ Erro ao apagar tabela prestadores:", err.message);
    } else {
      console.log("✅ Tabela prestadores apagada com sucesso");
    }
  });

  // ✅ fecha conexão
  db.close(() => {
    console.log("🔒 Conexão com banco fechada");
  });
});

