// routes/fornecedoresRoutes.js

const express = require("express");
const router = express.Router();

const db = require("../config/db");
const auth = require("../middlewares/auth");

const multer = require("multer");
const path = require("path");
const fs = require("fs");


// ================= UPLOAD =================
  const storage = multer.diskStorage({

    destination: (req, file, cb) => {

      const destino = path.join(
        __dirname,
        "..",
        "tempUploads"
      );

      fs.mkdirSync(destino, {
        recursive: true
      });

      cb(null, destino);

    },

    filename: (req, file, cb) => {

      cb(
        null,
        Date.now() + "-" + file.originalname
      );

    }

  });

  const upload = multer({
    storage
  });

  function gerarNomePasta(id, nome) {
    const nomeLimpo = (nome || "FORNECEDOR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "_")
      .replace(/_+/g, "_")
      .toUpperCase();

    return `${String(id).padStart(6, "0")}-${nomeLimpo}`;
  }

  // ================= CREATE =================
  router.post(
    "/",
    auth,
    upload.fields([
      { name: "alvara", maxCount: 1 },
      { name: "cartaoCnpj", maxCount: 1 }
    ]),
    (req, res) => {

      const fornecedor = req.body;

      const alvara =
        req.files?.alvara?.[0]?.filename || "";

      const cartaoCnpj =
        req.files?.cartaoCnpj?.[0]?.filename || "";

      db.run(
        `
        INSERT INTO fornecedores (
          razaoSocial, nomeFantasia, documento,
          inscricaoEstadual, inscricaoMunicipal,
          endereco, complemento, bairro, cidade, estado, pais, cep,
          telefone, celular,
          tributacao, icms,
          emailDanfe, emailCobranca,
          banco, agencia, conta, chavePix,
          responsavel, telefoneResponsavel, emailResponsavel,
          comercial, telefoneComercial, emailComercial,
          financeiro, telefoneFinanceiro, emailFinanceiro,
          descricaoServico,
          alvara, cartaoCnpj,
          dataHora, cadastradoPor
        )
        VALUES (${Array(36).fill("?").join(",")})
        `,
        [
          fornecedor.razaoSocial || "",
          fornecedor.nomeFantasia || "",
          fornecedor.documento || "",

          fornecedor.inscricaoEstadual || "",
          fornecedor.inscricaoMunicipal || "",

          fornecedor.endereco || "",
          fornecedor.complemento || "",
          fornecedor.bairro || "",
          fornecedor.cidade || "",
          fornecedor.estado || "",
          fornecedor.pais || "",
          fornecedor.cep || "",

          fornecedor.telefone || "",
          fornecedor.celular || "",

          fornecedor.tributacao || "",
          fornecedor.icms || "",

          fornecedor.emailDanfe || "",
          fornecedor.emailCobranca || "",

          fornecedor.banco || "",
          fornecedor.agencia || "",
          fornecedor.conta || "",
          fornecedor.chavePix || "",

          fornecedor.responsavel || "",
          fornecedor.telefoneResponsavel || "",
          fornecedor.emailResponsavel || "",

          fornecedor.comercial || "",
          fornecedor.telefoneComercial || "",
          fornecedor.emailComercial || "",

          fornecedor.financeiro || "",
          fornecedor.telefoneFinanceiro || "",
          fornecedor.emailFinanceiro || "",

          fornecedor.descricaoServico || "",

          alvara,
          cartaoCnpj,

          fornecedor.dataHora || "",
          fornecedor.cadastradoPor || ""
        ],
        function (err) {

          if (err) {
            console.error("❌ Erro ao salvar:", err);

            return res.status(500).json({
              erro: "Erro ao salvar fornecedor"
            });
          }

          const fornecedorId = this.lastID;

          const pastaDocumentos = gerarNomePasta(
            fornecedorId,
            fornecedor.nomeFantasia || fornecedor.razaoSocial
          );

          const caminhoPasta = path.join(
            __dirname,
            "..",
            "cadastros",
            "fornecedores",
            "documentos",
            pastaDocumentos
          );

          fs.mkdirSync(caminhoPasta, {
            recursive: true
          });

          // mover alvará
          if (req.files?.alvara?.[0]) {

            const origem = req.files.alvara[0].path;

            const destino = path.join(
              caminhoPasta,
              "alvara.pdf"
            );

            fs.renameSync(
              origem,
              destino
            );
          }

          // mover cartão CNPJ
          if (req.files?.cartaoCnpj?.[0]) {

            const origem = req.files.cartaoCnpj[0].path;

            const destino = path.join(
              caminhoPasta,
              "cartaoCnpj.pdf"
            );

            fs.renameSync(
              origem,
              destino
            );
          }

          db.run(
            `
            UPDATE fornecedores
            SET pastaDocumentos = ?
            WHERE id = ?
            `,
            [
              pastaDocumentos,
              fornecedorId
            ],
            (err) => {

              if (err) {

                console.error(
                  "❌ Erro ao atualizar pastaDocumentos:",
                  err
                );

                return res.status(500).json({
                  erro: "Erro ao atualizar fornecedor"
                });

              }

              res.json({
                sucesso: true,
                id: fornecedorId
              });

            }
          );

        }
      );

    }
  );

// ================= LISTAR =================
  router.get("/", auth, (req, res) => {

    db.all(
      "SELECT * FROM fornecedores ORDER BY id DESC",
      [],
      (err, rows) => {

        if (err){
          console.error(err);

          return res.status(500).json({
            erro: "Erro ao listar"
          });
        }

        res.json(rows);

      }
    );

  });

// ================= BUSCAR POR ID =================
  router.get("/:id", auth, (req, res) => {

    db.get(
      "SELECT * FROM fornecedores WHERE id = ?",
      [req.params.id],
      (err, row) => {

        if (err){
          console.error(err);

          return res.status(500).json({
            erro: "Erro ao buscar"
          });
        }

        if (!row){
          return res.status(404).json({
            erro: "Não encontrado"
          });
        }

        res.json(row);

      }
    );

  });

// ================= UPDATE =================
router.put(
  "/:id",
  auth,
  upload.fields([
    { name: "alvara", maxCount: 1 },
    { name: "cartaoCnpj", maxCount: 1 }
  ]),
  (req, res) => {

    const id = req.params.id;
    const fornecedor = req.body;

    db.get(
      `
      SELECT
        alvara,
        cartaoCnpj,
        pastaDocumentos
      FROM fornecedores
      WHERE id = ?
      `,
      [id],
      (err, atual) => {

        if(err){
          console.error(err);

          return res.status(500).json({
            erro: "Erro ao buscar fornecedor"
          });
        }

        const alvara =
          req.files?.alvara?.[0]?.filename ||
          atual?.alvara ||
          "";

        const cartaoCnpj =
          req.files?.cartaoCnpj?.[0]?.filename ||
          atual?.cartaoCnpj ||
          "";
          
        if (!atual?.pastaDocumentos) {
          return res.status(400).json({
            erro: "Fornecedor sem pastaDocumentos configurada"
          });
        }

        const pastaFornecedor = path.join(
          __dirname,
          "..",
          "cadastros",
          "fornecedores",
          "documentos",
          atual.pastaDocumentos
        );

        fs.mkdirSync(pastaFornecedor, {
          recursive: true
        });

        // novo alvará
        if (req.files?.alvara?.[0]) {

          const origem =
            req.files.alvara[0].path;

          const destino = path.join(
            pastaFornecedor,
            "alvara.pdf"
          );

          fs.renameSync(
            origem,
            destino
          );
        }

        // novo cartão
        if (req.files?.cartaoCnpj?.[0]) {

          const origem =
            req.files.cartaoCnpj[0].path;

          const destino = path.join(
            pastaFornecedor,
            "cartaoCnpj.pdf"
          );

          fs.renameSync(
            origem,
            destino
          );
        }


        db.run(
          `
          UPDATE fornecedores SET

            razaoSocial=?,
            nomeFantasia=?,
            documento=?,

            inscricaoEstadual=?,
            inscricaoMunicipal=?,

            endereco=?,
            complemento=?,
            bairro=?,
            cidade=?,
            estado=?,
            pais=?,
            cep=?,

            telefone=?,
            celular=?,

            tributacao=?,
            icms=?,

            emailDanfe=?,
            emailCobranca=?,

            banco=?,
            agencia=?,
            conta=?,
            chavePix=?,

            responsavel=?,
            telefoneResponsavel=?,
            emailResponsavel=?,

            comercial=?,
            telefoneComercial=?,
            emailComercial=?,

            financeiro=?,
            telefoneFinanceiro=?,
            emailFinanceiro=?,

            descricaoServico=?,

            alvara=?,
            cartaoCnpj=?

          WHERE id=?
          `,
          [

            fornecedor.razaoSocial || "",
            fornecedor.nomeFantasia || "",
            fornecedor.documento || "",

            fornecedor.inscricaoEstadual || "",
            fornecedor.inscricaoMunicipal || "",

            fornecedor.endereco || "",
            fornecedor.complemento || "",
            fornecedor.bairro || "",
            fornecedor.cidade || "",
            fornecedor.estado || "",
            fornecedor.pais || "",
            fornecedor.cep || "",

            fornecedor.telefone || "",
            fornecedor.celular || "",

            fornecedor.tributacao || "",
            fornecedor.icms || "",

            fornecedor.emailDanfe || "",
            fornecedor.emailCobranca || "",

            fornecedor.banco || "",
            fornecedor.agencia || "",
            fornecedor.conta || "",
            fornecedor.chavePix || "",

            fornecedor.responsavel || "",
            fornecedor.telefoneResponsavel || "",
            fornecedor.emailResponsavel || "",

            fornecedor.comercial || "",
            fornecedor.telefoneComercial || "",
            fornecedor.emailComercial || "",

            fornecedor.financeiro || "",
            fornecedor.telefoneFinanceiro || "",
            fornecedor.emailFinanceiro || "",

            fornecedor.descricaoServico || "",

            alvara,
            cartaoCnpj,

            id

          ],
          function(err){

            if(err){

              console.error(err);

              return res.status(500).json({
                erro: "Erro ao atualizar fornecedor"
              });

            }

            res.json({
              sucesso: true
            });

          }
        );

      }
    );

  }
);

// ================= DELETE =================
router.delete("/:id", auth, (req, res) => {

  db.get(
    `
    SELECT pastaDocumentos
    FROM fornecedores
    WHERE id = ?
    `,
    [req.params.id],
    (err, fornecedor) => {

      if (err) {
        return res.status(500).json({
          erro: "Erro ao buscar fornecedor"
        });
      }

      if (!fornecedor) {
        return res.status(404).json({
          erro: "Fornecedor não encontrado"
        });
      }

      // remove a pasta inteira do fornecedor
      if (fornecedor.pastaDocumentos) {

        const pastaFornecedor = path.join(
          __dirname,
          "..",
          "cadastros",
          "fornecedores",
          "documentos",
          fornecedor.pastaDocumentos
        );

        try {

          if (fs.existsSync(pastaFornecedor)) {

            fs.rmSync(
              pastaFornecedor,
              {
                recursive: true,
                force: true
              }
            );

          }

        } catch (err) {

          console.error(
            "Erro ao remover pasta do fornecedor:",
            err
          );

        }

      }

      db.run(
        "DELETE FROM fornecedores WHERE id = ?",
        [req.params.id],
        function(err) {

          if (err) {
            return res.status(500).json({
              erro: "Erro ao excluir fornecedor"
            });
          }

          res.json({
            sucesso: true
          });

        }
      );

    }
  );

});

// ================= ABRIR ALVARÁ =================
router.get("/:id/alvara", auth, (req, res) => {

  db.get(
    `
    SELECT pastaDocumentos
    FROM fornecedores
    WHERE id = ?
    `,
    [req.params.id],
    (err, fornecedor) => {

      if (err) {
        return res.status(500).json({
          erro: "Erro ao localizar fornecedor"
        });
      }

      if (!fornecedor?.pastaDocumentos) {
        return res.status(404).json({
          erro: "Pasta do fornecedor não encontrada"
        });
      }

      const arquivo = path.join(
        __dirname,
        "..",
        "cadastros",
        "fornecedores",
        "documentos",
        fornecedor.pastaDocumentos,
        "alvara.pdf"
      );

      if (!fs.existsSync(arquivo)) {
        return res.status(404).json({
          erro: "Alvará não encontrado"
        });
      }

      res.sendFile(arquivo);

    }
  );

});

// ================= ABRIR CARTÃO CNPJ =================
router.get("/:id/cartao", auth, (req, res) => {

  db.get(
    `
    SELECT pastaDocumentos
    FROM fornecedores
    WHERE id = ?
    `,
    [req.params.id],
    (err, fornecedor) => {

      if (err) {
        return res.status(500).json({
          erro: "Erro ao localizar fornecedor"
        });
      }

      if (!fornecedor?.pastaDocumentos) {
        return res.status(404).json({
          erro: "Pasta do fornecedor não encontrada"
        });
      }

      const arquivo = path.join(
        __dirname,
        "..",
        "cadastros",
        "fornecedores",
        "documentos",
        fornecedor.pastaDocumentos,
        "cartaoCnpj.pdf"
      );

      if (!fs.existsSync(arquivo)) {
        return res.status(404).json({
          erro: "Cartão CNPJ não encontrado"
        });
      }

      res.sendFile(arquivo);

    }
  );

});

// ================= EXPORT =================

module.exports = router;