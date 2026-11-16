const db = require("../config/db");

// ✅ RECEBIMENTO 1
db.run(
  "ALTER TABLE os ADD COLUMN data_hora_recebimento1 TEXT",
  (err) => {
    if (err) {
      console.error("Erro recebimento1:", err.message);
    } else {
      console.log("✅ Coluna data_hora_recebimento1 criada");
    }
  }
);

// ✅ RECEBIMENTO 2
db.run(
  "ALTER TABLE os ADD COLUMN data_hora_recebimento2 TEXT",
  (err) => {
    if (err) {
      console.error("Erro recebimento2:", err.message);
    } else {
      console.log("✅ Coluna data_hora_recebimento2 criada");
    }
  }
);

// ✅ RECEBIMENTO 3
db.run(
  "ALTER TABLE os ADD COLUMN data_hora_recebimento3 TEXT",
  (err) => {
    if (err) {
      console.error("Erro recebimento3:", err.message);
    } else {
      console.log("✅ Coluna data_hora_recebimento3 criada");
    }
  }
);
