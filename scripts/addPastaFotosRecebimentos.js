// scripts/addPastaFotosRecebimentos.js

const db = require("../config/db");

db.run(
  `ALTER TABLE recebimentos ADD COLUMN pastaFotos TEXT`,
  (err) => {

    if(err){
      console.log(
        `pastaFotos: ${err.message}`
      );
    }
    else{
      console.log(
        "✅ Coluna pastaFotos criada"
      );
    }

    process.exit();
  }
);