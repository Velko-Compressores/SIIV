const db = require("../config/db");

db.all(
  "PRAGMA table_info(clientes)",
  [],
  (err, rows) => {

    if (err) {
      console.error("Erro ao verificar tabela:", err.message);
      return;
    }

    const existe = rows.some(
      col => col.name === "observacoes"
    );

    if (existe) {
      console.log("✅ Coluna observacoes já existe");
      return;
    }

    db.run(
      "ALTER TABLE clientes ADD COLUMN observacoes TEXT",
      (err) => {
        if (err) {
          console.error(
            "Erro ao criar observacoes:",
            err.message
          );
        } else {
          console.log(
            "✅ Coluna observacoes criada com sucesso"
          );
        }
      }
    );
  }
);