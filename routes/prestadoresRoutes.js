// routes/prestadoresRoutes.js

const express = require("express");
const router = express.Router();

const db = require("../config/db");
const auth = require("../middlewares/auth");

const multer = require("multer");
const path = require("path");
const fs = require("fs");


// ================= UPLOAD =================
  const PASTA_BASE_DOCUMENTOS = path.join(
    __dirname,
    "..",
    "cadastros",
    "prestadores",
    "documentos"
  );

  fs.mkdirSync(
    PASTA_BASE_DOCUMENTOS,
    { recursive: true }
  );

  const storage = multer.diskStorage({

    destination: (req, file, cb) => {
      cb(null, PASTA_BASE_DOCUMENTOS);
    },

    filename: (req, file, cb) => {
      cb(
        null,
        Date.now() +
        "-" +
        file.fieldname +
        path.extname(file.originalname)
      );
    }

  });

  const upload = multer({ storage });


// ================= CREATE =================
  router.post(
    "/",
    auth,
    upload.fields([
      { name: "alvara", maxCount: 1 },
      { name: "cartaoCnpj", maxCount: 1 }
    ]),
    (req, res) => {

      const prestador = req.body;

      const alvara =
        req.files?.alvara?.[0]?.filename || "";

      const cartaoCnpj =
        req.files?.cartaoCnpj?.[0]?.filename || "";

      db.run(
        `
        INSERT INTO prestadores (
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
          prestador.razaoSocial || "",
          prestador.nomeFantasia || "",
          prestador.documento || "",

          prestador.inscricaoEstadual || "",
          prestador.inscricaoMunicipal || "",

          prestador.endereco || "",
          prestador.complemento || "",
          prestador.bairro || "",
          prestador.cidade || "",
          prestador.estado || "",
          prestador.pais || "",
          prestador.cep || "",

          prestador.telefone || "",
          prestador.celular || "",

          prestador.tributacao || "",
          prestador.icms || "",

          prestador.emailDanfe || "",
          prestador.emailCobranca || "",

          prestador.banco || "",
          prestador.agencia || "",
          prestador.conta || "",
          prestador.chavePix || "",

          prestador.responsavel || "",
          prestador.telefoneResponsavel || "",
          prestador.emailResponsavel || "",

          prestador.comercial || "",
          prestador.telefoneComercial || "",
          prestador.emailComercial || "",

          prestador.financeiro || "",
          prestador.telefoneFinanceiro || "",
          prestador.emailFinanceiro || "",

          prestador.descricaoServico || "",

          alvara,
          cartaoCnpj,

          prestador.dataHora || "",
          prestador.cadastradoPor || ""
        ],
        function(err){

          if (err){
            console.error("❌ Erro ao salvar:", err);

            return res.status(500).json({
              erro: "Erro ao salvar prestador"
            });
          }

          const id = this.lastID;

          const pastaPrestador =
            `${String(id).padStart(6, "0")}-${
              (prestador.nomeFantasia ||
              prestador.razaoSocial ||
              "PRESTADOR")
                .trim()
                .replace(/[^\w\s-]/g, "")
                .replace(/\s+/g, "-")
                .toUpperCase()
            }`;

          try {

            const pastaDestino = path.join(
              PASTA_BASE_DOCUMENTOS,
              pastaPrestador
            );

            fs.mkdirSync(
              pastaDestino,
              { recursive: true }
            );

            const moverDocumento = (
              arquivoAtual,
              nomeNovo
            ) => {

              if (!arquivoAtual) {
                return "";
              }

              const extensao =
                path.extname(arquivoAtual);

              const novoNome =
                `${nomeNovo}${extensao}`;

              fs.renameSync(
                path.join(
                  PASTA_BASE_DOCUMENTOS,
                  arquivoAtual
                ),
                path.join(
                  pastaDestino,
                  novoNome
                )
              );

              return novoNome;
            };

            const novoAlvara =
              moverDocumento(
                alvara,
                "alvara"
              );

            const novoCartaoCnpj =
              moverDocumento(
                cartaoCnpj,
                "cartaoCnpj"
              );

            db.run(
              `
              UPDATE prestadores
              SET
                pastaDocumentos = ?,
                alvara = ?,
                cartaoCnpj = ?
              WHERE id = ?
              `,
              [
                pastaPrestador,
                novoAlvara,
                novoCartaoCnpj,
                id
              ],
              (err) => {

                if (err) {

                  console.error(
                    "❌ Erro ao atualizar documentos:",
                    err
                  );

                  return res.status(500).json({
                    erro: "Erro ao finalizar cadastro"
                  });

                }

                res.json({
                  sucesso: true,
                  id
                });

              }
            );

          } catch(err){

            console.error(
              "❌ Erro ao mover documentos:",
              err
            );

            return res.status(500).json({
              erro: "Erro ao mover documentos"
            });

          }

        }
      );

    }
  );

// ================= LISTAR =================
  router.get("/", auth, (req, res) => {

    db.all(
      "SELECT * FROM prestadores ORDER BY id DESC",
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
      "SELECT * FROM prestadores WHERE id = ?",
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
      const prestador = req.body;

      db.get(
        `
        SELECT
          pastaDocumentos,
          alvara,
          cartaoCnpj
        FROM prestadores
        WHERE id = ?
        `,
        [id],
        (err, atual) => {

          if(err){
            console.error(err);

            return res.status(500).json({
              erro: "Erro ao buscar prestador"
            });
          }

          if(!atual){
            return res.status(404).json({
              erro: "Prestador não encontrado"
            });
          }

          try {

            const pastaDestino = path.join(
              PASTA_BASE_DOCUMENTOS,
              atual.pastaDocumentos
            );

            fs.mkdirSync(
              pastaDestino,
              { recursive: true }
            );

            const atualizarDocumento = (
              arquivoTemporario,
              nomePadrao,
              arquivoAtual
            ) => {

              if(!arquivoTemporario){
                return arquivoAtual || "";
              }

              const extensao =
                path.extname(arquivoTemporario);

              const novoNome =
                `${nomePadrao}${extensao}`;

              const antigo = path.join(
                pastaDestino,
                arquivoAtual || ""
              );

              try {

                if(
                  arquivoAtual &&
                  fs.existsSync(antigo)
                ){
                  fs.unlinkSync(antigo);
                }

              } catch(err){

                console.error(
                  `Erro ao apagar ${nomePadrao} antigo:`,
                  err
                );

              }

              fs.renameSync(
                path.join(
                  PASTA_BASE_DOCUMENTOS,
                  arquivoTemporario
                ),
                path.join(
                  pastaDestino,
                  novoNome
                )
              );

              return novoNome;
            };

            const alvara =
              atualizarDocumento(
                req.files?.alvara?.[0]?.filename,
                "alvara",
                atual.alvara
              );

            const cartaoCnpj =
              atualizarDocumento(
                req.files?.cartaoCnpj?.[0]?.filename,
                "cartaoCnpj",
                atual.cartaoCnpj
              );

            db.run(
              `
              UPDATE prestadores SET

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

                prestador.razaoSocial || "",
                prestador.nomeFantasia || "",
                prestador.documento || "",

                prestador.inscricaoEstadual || "",
                prestador.inscricaoMunicipal || "",

                prestador.endereco || "",
                prestador.complemento || "",
                prestador.bairro || "",
                prestador.cidade || "",
                prestador.estado || "",
                prestador.pais || "",
                prestador.cep || "",

                prestador.telefone || "",
                prestador.celular || "",

                prestador.tributacao || "",
                prestador.icms || "",

                prestador.emailDanfe || "",
                prestador.emailCobranca || "",

                prestador.banco || "",
                prestador.agencia || "",
                prestador.conta || "",
                prestador.chavePix || "",

                prestador.responsavel || "",
                prestador.telefoneResponsavel || "",
                prestador.emailResponsavel || "",

                prestador.comercial || "",
                prestador.telefoneComercial || "",
                prestador.emailComercial || "",

                prestador.financeiro || "",
                prestador.telefoneFinanceiro || "",
                prestador.emailFinanceiro || "",

                prestador.descricaoServico || "",

                alvara,
                cartaoCnpj,

                id

              ],
              function(err){

                if(err){

                  console.error(err);

                  return res.status(500).json({
                    erro: "Erro ao atualizar prestador"
                  });

                }

                res.json({
                  sucesso: true
                });

              }
            );

          } catch(err){

            console.error(
              "Erro ao atualizar documentos:",
              err
            );

            return res.status(500).json({
              erro: "Erro ao atualizar documentos"
            });

          }

        }
      );

    }
  );

// ================= DELETE =================
  router.delete("/:id", auth, (req, res) => {

    db.get(
      "SELECT * FROM prestadores WHERE id = ?",
      [req.params.id],
      (err, prestador) => {

        if (err){
          return res.status(500).json({
            erro: "Erro ao buscar prestador"
          });
        }

        if (!prestador){
          return res.status(404).json({
            erro: "Prestador não encontrado"
          });
        }

        // remove pasta de documentos do prestador
        if (prestador.pastaDocumentos) {

          const pastaPrestador = path.join(
            PASTA_BASE_DOCUMENTOS,
            prestador.pastaDocumentos
          );

          try {

            if (fs.existsSync(pastaPrestador)) {

              fs.rmSync(
                pastaPrestador,
                {
                  recursive: true,
                  force: true
                }
              );

            }

          } catch (err) {

            console.error(
              "Erro ao remover pasta do prestador:",
              err
            );

          }

        }        

        db.run(
          "DELETE FROM prestadores WHERE id = ?",
          [req.params.id],
          function(err){

            if (err){
              return res.status(500).json({
                erro: "Erro ao excluir prestador"
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
      SELECT
        alvara,
        pastaDocumentos
      FROM prestadores
      WHERE id = ?
      `,
      [req.params.id],
      (err, row) => {

        if (err) {
          return res.status(500).json({
            erro: "Erro ao buscar Alvará"
          });
        }

        if (!row || !row.alvara) {
          return res.status(404).json({
            erro: "Alvará não encontrado"
          });
        }

        const caminho = path.join(
          PASTA_BASE_DOCUMENTOS,
          row.pastaDocumentos,
          row.alvara
        );

        if (!fs.existsSync(caminho)) {
          return res.status(404).json({
            erro: "Arquivo do Alvará não encontrado"
          });
        }

        res.sendFile(caminho);

      }
    );

  });

// ================= ABRIR CARTÃO CNPJ =================
  router.get("/:id/cartao", auth, (req, res) => {

    db.get(
      `
      SELECT
        cartaoCnpj,
        pastaDocumentos
      FROM prestadores
      WHERE id = ?
      `,
      [req.params.id],
      (err, row) => {

        if (err) {
          return res.status(500).json({
            erro: "Erro ao buscar Cartão CNPJ"
          });
        }

        if (!row || !row.cartaoCnpj) {
          return res.status(404).json({
            erro: "Cartão CNPJ não encontrado"
          });
        }

        const caminho = path.join(
          PASTA_BASE_DOCUMENTOS,
          row.pastaDocumentos,
          row.cartaoCnpj
        );

        if (!fs.existsSync(caminho)) {
          return res.status(404).json({
            erro: "Arquivo do Cartão CNPJ não encontrado"
          });
        }

        res.sendFile(caminho);

      }
    );

  });


// ================= EXPORT =================

module.exports = router;