const db = require("../config/db");
const fs = require("fs");
const path = require("path");

console.log("🚀 Iniciando migração dos documentos dos clientes...");

db.all(
  `
  SELECT
    id,
    pastaDocumentos,
    alvara,
    cartaoCnpj
  FROM clientes
  `,
  [],
  (err, clientes) => {

    if (err) {

      console.error(
        "❌ Erro ao consultar clientes:",
        err
      );

      process.exit(1);
    }

    clientes.forEach(cliente => {

      if (!cliente.pastaDocumentos) {
        return;
      }

      const pastaDestino = path.join(
        __dirname,
        "..",
        "cadastros",
        "clientes",
        "documentos",
        cliente.pastaDocumentos
      );

      fs.mkdirSync(
        pastaDestino,
        {
          recursive: true
        }
      );

      // ALVARÁ

      if (cliente.alvara) {

        const origem = path.join(
          __dirname,
          "..",
          "documentosClientes",
          "alvaras",
          cliente.alvara
        );

        const destino = path.join(
          pastaDestino,
          "alvara.pdf"
        );

        if (fs.existsSync(origem)) {

          fs.copyFileSync(
            origem,
            destino
          );

          console.log(
            `✅ Cliente ${cliente.id} - Alvará migrado`
          );

        } else {

          console.log(
            `⚠️ Cliente ${cliente.id} - Alvará não encontrado`
          );

        }

      }

      // CARTÃO CNPJ

      if (cliente.cartaoCnpj) {

        const origem = path.join(
          __dirname,
          "..",
          "documentosClientes",
          "cartoesCnpj",
          cliente.cartaoCnpj
        );

        const destino = path.join(
          pastaDestino,
          "cartaoCnpj.pdf"
        );

        if (fs.existsSync(origem)) {

          fs.copyFileSync(
            origem,
            destino
          );

          console.log(
            `✅ Cliente ${cliente.id} - Cartão CNPJ migrado`
          );

        } else {

          console.log(
            `⚠️ Cliente ${cliente.id} - Cartão CNPJ não encontrado`
          );

        }

      }

    });

    console.log(
      "\n✅ Migração dos documentos concluída."
    );

    db.close();

  }
);