// addTipoRecebimentos.js

const db = require("../config/db");

db.run(
  "ALTER TABLE recebimentos ADD COLUMN tipo TEXT",
  (err) => {
    if (err) {
      console.error(
        "Erro ao criar coluna tipo:",
        err.message
      );
    } else {
      console.log(
        "✅ Coluna tipo criada com sucesso"
      );
    }
  }
);