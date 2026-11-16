// models/userModel.js

const db = require("../config/db");

// ✅ BUSCAR USUÁRIO POR NOME
const findUserByNome = (nome, callback) => {
  db.get(
    "SELECT * FROM users WHERE nome = ?",
    [nome],
    (err, row) => {
      if (err) return callback(err);
      callback(null, row);
    }
  );
};

module.exports = {
  findUserByNome
};