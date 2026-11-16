// routes/clienteRoutes.js

const fs = require("fs");
const express = require("express");
const router = express.Router();

const db = require("../config/db");
const auth = require("../middlewares/auth");

const multer = require("multer");
const path = require("path");


// ================= UPLOAD CLIENTES =================

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

      const nomeArquivo =
        Date.now() +
        "-" +
        file.originalname;

      cb(null, nomeArquivo);

    }
  });

  const upload = multer({
    storage
  });

  // formatacao pasta documentos
  function gerarNomePasta(id, nome) {

    const nomeLimpo = (nome || "CLIENTE")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "_")
      .replace(/_+/g, "_")
      .toUpperCase();

    return `${String(id).padStart(6, "0")}-${nomeLimpo}`;

  }



// ✅ CREATE - CRIAR CLIENTE
router.post(
  "/",
  auth,
  upload.fields([
    { name: "alvara", maxCount: 1 },
    { name: "cartaoCnpj", maxCount: 1 }
  ]),
  (req, res) => {
    const cliente = req.body;
    const alvara =
      req.files?.alvara?.[0]?.filename || "";
    const cartaoCnpj =
      req.files?.cartaoCnpj?.[0]?.filename || "";

    db.run(`
      INSERT INTO clientes (
        tipoPessoa,
        documento,
        nomePF,

        razaoSocial,
        nomeFantasia,
        inscricaoEstadual,
        inscricaoMunicipal,

        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        pais,
        cep,

        telefone,
        celular,

        tributacao,
        icms,

        emailDanfe,
        emailCobranca,

        responsavel1,
        telefoneResponsavel1,
        emailResponsavel1,

        responsavel2,
        telefoneResponsavel2,
        emailResponsavel2,

        compras,
        telefoneCompras,
        emailCompras,

        areaTecnica,
        telefoneAreaTecnica,
        emailAreaTecnica,

        contasPagar,
        telefoneContasPagar,
        emailContasPagar,

        ramoAtividade,
        marcaCompressor,

        nomeEmpresa1,
        contatoEmpresa1,
        telEmpresa1,
        emailEmpresa1,

        nomeEmpresa2,
        contatoEmpresa2,
        telEmpresa2,
        emailEmpresa2,

        nomeEmpresa3,
        contatoEmpresa3,
        telEmpresa3,
        emailEmpresa3,

        dataHora,
        cadastradoPor,

        observacoes,

        alvara,
        cartaoCnpj
      )

      VALUES (${Array(55).fill("?").join(",")})
    `,
    [
      cliente.tipoPessoa || "",
      cliente.documento || "",
      cliente.nomePF || "",

      cliente.razaoSocial || "",
      cliente.nomeFantasia || "",
      cliente.inscricaoEstadual || "",
      cliente.inscricaoMunicipal || "",

      cliente.endereco || "",
      cliente.numero || "",
      cliente.complemento || "",
      cliente.bairro || "",
      cliente.cidade || "",
      cliente.estado || "",
      cliente.pais || "",
      cliente.cep || "",

      cliente.telefone || "",
      cliente.celular || "",

      cliente.tributacao || "",
      cliente.icms || "",

      cliente.emailDanfe || "",
      cliente.emailCobranca || "",

      cliente.responsavel1 || "",
      cliente.telefoneResponsavel1 || "",
      cliente.emailResponsavel1 || "",

      cliente.responsavel2 || "",
      cliente.telefoneResponsavel2 || "",
      cliente.emailResponsavel2 || "",

      cliente.compras || "",
      cliente.telefoneCompras || "",
      cliente.emailCompras || "",

      cliente.areaTecnica || "",
      cliente.telefoneAreaTecnica || "",
      cliente.emailAreaTecnica || "",

      cliente.contasPagar || "",
      cliente.telefoneContasPagar || "",
      cliente.emailContasPagar || "",


      cliente.ramoAtividade || "[]",
      cliente.marcaCompressor || "[]",


      cliente.nomeEmpresa1 || "",
      cliente.contatoEmpresa1 || "",
      cliente.telEmpresa1 || "",
      cliente.emailEmpresa1 || "",

      cliente.nomeEmpresa2 || "",
      cliente.contatoEmpresa2 || "",
      cliente.telEmpresa2 || "",
      cliente.emailEmpresa2 || "",

      cliente.nomeEmpresa3 || "",
      cliente.contatoEmpresa3 || "",
      cliente.telEmpresa3 || "",
      cliente.emailEmpresa3 || "",

      cliente.dataHora || "",
      cliente.cadastradoPor || "",

      cliente.observacoes || "",

      alvara,
      cartaoCnpj
    ],
    function(err){

      if (err) {
        console.error("❌ Erro ao criar cliente:", err);

        return res.status(500).json({
          erro: "Erro ao criar cliente"
        });
      }

      const clienteId = this.lastID;

      const pastaDocumentos = gerarNomePasta(
        clienteId,
        cliente.nomeFantasia || cliente.nomePF
      );

      const caminhoPasta = path.join(
        __dirname,
        "..",
        "cadastros",
        "clientes",
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
        UPDATE clientes
        SET pastaDocumentos = ?
        WHERE id = ?
        `,
        [
          pastaDocumentos,
          clienteId
        ],
        (err) => {

          if (err) {
            console.error(
              "❌ Erro ao atualizar pastaDocumentos:",
              err
            );

            return res.status(500).json({
              erro: "Erro ao atualizar cliente"
            });
          }

          res.json({
            sucesso: true,
            id: clienteId
          });

        }
      );
    }
  );
});

// ✅ READ - LISTAR CLIENTES
router.get("/", auth, (req, res) => {
  db.all("SELECT * FROM clientes ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      console.error("❌ Erro ao listar:", err);
      return res.status(500).json({ erro: err.message });
    }
    rows.forEach(r => {
      try {
        r.ramoAtividade = JSON.parse(r.ramoAtividade || "[]");
      } catch {
        r.ramoAtividade = [];
      }
      try {
        r.marcaCompressor = JSON.parse(r.marcaCompressor || "[]");
      } catch {
        r.marcaCompressor = [];
      }
    });
    res.json(rows);
  });
});

// ✅ BUSCAR CLIENTE POR ID
router.get("/:id", auth, (req, res) => {

  const { id } = req.params;

  db.get(
    "SELECT * FROM clientes WHERE id = ?",
    [id],
    (err, row) => {

      if (err) {
        console.error(err);
        return res.status(500).json({
          erro: "Erro ao buscar cliente"
        });
      }

      if (!row) {
        return res.status(404).json({
          erro: "Cliente não encontrado"
        });
      }

      try {
        row.ramoAtividade =
          JSON.parse(row.ramoAtividade || "[]");
      } catch {
        row.ramoAtividade = [];
      }

      try {
        row.marcaCompressor =
          JSON.parse(row.marcaCompressor || "[]");
      } catch {
        row.marcaCompressor = [];
      }

      res.json(row);

    }
  );

});

// ✅ UPDATE - EDITAR CLIENTE
router.put(
  "/:id",
  auth,
  upload.fields([
    { name: "alvara", maxCount: 1 },
    { name: "cartaoCnpj", maxCount: 1 }
  ]),
  (req, res) => {

    const id = req.params.id;
    const cliente = req.body;

    db.get(
      `
      SELECT
        alvara,
        cartaoCnpj,
        pastaDocumentos
      FROM clientes
      WHERE id = ?
      `,
    
      [id],
      (err, atual) => {

        if (err) {
          console.error(err);
          return res.status(500).json({
            erro: "Erro ao buscar cliente"
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
          if (atual?.pastaDocumentos) {
          const pastaCliente = path.join(
            __dirname,
            "..",
            "cadastros",
            "clientes",
            "documentos",
            atual.pastaDocumentos
          );

          // novo alvará
          if (req.files?.alvara?.[0]) {

            const origem =
              req.files.alvara[0].path;

            const destino = path.join(
              pastaCliente,
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
              pastaCliente,
              "cartaoCnpj.pdf"
            );

            fs.renameSync(
              origem,
              destino
            );
          }

        }


        const values = [

          cliente.tipoPessoa || "",
          cliente.documento || "",
          cliente.nomePF || "",
          cliente.razaoSocial || "",
          cliente.nomeFantasia || "",
          cliente.inscricaoEstadual || "",
          cliente.inscricaoMunicipal || "",

          cliente.endereco || "",
          cliente.numero || "",
          cliente.complemento || "",
          cliente.bairro || "",
          cliente.cidade || "",
          cliente.estado || "",
          cliente.pais || "",
          cliente.cep || "",

          cliente.telefone || "",
          cliente.celular || "",
          cliente.tributacao || "",
          cliente.icms || "",

          cliente.emailDanfe || "",
          cliente.emailCobranca || "",

          cliente.responsavel1 || "",
          cliente.telefoneResponsavel1 || "",
          cliente.emailResponsavel1 || "",

          cliente.responsavel2 || "",
          cliente.telefoneResponsavel2 || "",
          cliente.emailResponsavel2 || "",

          cliente.compras || "",
          cliente.telefoneCompras || "",
          cliente.emailCompras || "",

          cliente.areaTecnica || "",
          cliente.telefoneAreaTecnica || "",
          cliente.emailAreaTecnica || "",

          cliente.contasPagar || "",
          cliente.telefoneContasPagar || "",
          cliente.emailContasPagar || "",

          cliente.ramoAtividade || "[]",
          cliente.marcaCompressor || "[]",

          cliente.nomeEmpresa1 || "",
          cliente.contatoEmpresa1 || "",
          cliente.telEmpresa1 || "",
          cliente.emailEmpresa1 || "",

          cliente.nomeEmpresa2 || "",
          cliente.contatoEmpresa2 || "",
          cliente.telEmpresa2 || "",
          cliente.emailEmpresa2 || "",

          cliente.nomeEmpresa3 || "",
          cliente.contatoEmpresa3 || "",
          cliente.telEmpresa3 || "",
          cliente.emailEmpresa3 || "",

          cliente.observacoes || "",

          alvara,
          cartaoCnpj,

          id
        ];

        db.run(
          `
          UPDATE clientes SET

            tipoPessoa=?,
            documento=?,
            nomePF=?,
            razaoSocial=?,
            nomeFantasia=?,

            inscricaoEstadual=?,
            inscricaoMunicipal=?,

            endereco=?,
            numero=?,
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

            responsavel1=?,
            telefoneResponsavel1=?,
            emailResponsavel1=?,

            responsavel2=?,
            telefoneResponsavel2=?,
            emailResponsavel2=?,

            compras=?,
            telefoneCompras=?,
            emailCompras=?,

            areaTecnica=?,
            telefoneAreaTecnica=?,
            emailAreaTecnica=?,

            contasPagar=?,
            telefoneContasPagar=?,
            emailContasPagar=?,

            ramoAtividade=?,
            marcaCompressor=?,

            nomeEmpresa1=?,
            contatoEmpresa1=?,
            telEmpresa1=?,
            emailEmpresa1=?,

            nomeEmpresa2=?,
            contatoEmpresa2=?,
            telEmpresa2=?,
            emailEmpresa2=?,

            nomeEmpresa3=?,
            contatoEmpresa3=?,
            telEmpresa3=?,
            emailEmpresa3=?,

            observacoes=?,

            alvara=?,
            cartaoCnpj=?

          WHERE id=?
          `,
          values,
          function(err){

            if (err) {
              console.error(err);

              return res.status(500).json({
                erro: "Erro ao atualizar cliente"
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

// ✅ DELETAR CLIENTE
router.delete("/:id", auth, (req, res) => {
  const { id } = req.params;
  db.get(
    `
    SELECT
      pastaDocumentos
    FROM clientes
    WHERE id = ?
    `,
    [id],
    (err, cliente) => {

      if(err){

        console.error(err);

        return res.status(500).json({
          erro: "Erro ao localizar cliente"
        });

      }

      if(!cliente){

        return res.status(404).json({
          erro: "Cliente não encontrado"
        });

      }
      
      if (cliente.pastaDocumentos) {

        const pastaCliente = path.join(
          __dirname,
          "..",
          "cadastros",
          "clientes",
          "documentos",
          cliente.pastaDocumentos
        );

        try {

          if (fs.existsSync(pastaCliente)) {

            fs.rmSync(
              pastaCliente,
              {
                recursive: true,
                force: true
              }
            );

          }

        }
        catch(err) {

          console.error(
            "Erro ao remover pasta do cliente:",
            err
          );

        }

      }


      db.run(
        "DELETE FROM clientes WHERE id = ?",
        [id],
        function(err){

          if(err){

            console.error(err);

            return res.status(500).json({
              erro: "Erro ao deletar cliente"
            });

          }

          if(this.changes === 0){

            return res.status(404).json({
              erro: "Cliente não encontrado"
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

// ✅ VISUALIZAR ALVARÁ
router.get("/:id/alvara", auth, (req, res) => {

  const { id } = req.params;

  db.get(
    `
    SELECT pastaDocumentos
    FROM clientes
    WHERE id = ?
    `,
    [id],
    (err, cliente) => {

      if (err) {

        console.error(err);

        return res.status(500).json({
          erro: "Erro ao localizar cliente"
        });

      }

      if (!cliente?.pastaDocumentos) {

        return res.status(404).json({
          erro: "Pasta do cliente não encontrada"
        });

      }

      const arquivo = path.join(
        __dirname,
        "..",
        "cadastros",
        "clientes",
        "documentos",
        cliente.pastaDocumentos,
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

// ✅ VISUALIZAR CARTÃO CNPJ
router.get("/:id/cartao", auth, (req, res) => {

  const { id } = req.params;

  db.get(
    `
    SELECT pastaDocumentos
    FROM clientes
    WHERE id = ?
    `,
    [id],
    (err, cliente) => {

      if (err) {

        console.error(err);

        return res.status(500).json({
          erro: "Erro ao localizar cliente"
        });

      }

      if (!cliente?.pastaDocumentos) {

        return res.status(404).json({
          erro: "Pasta do cliente não encontrada"
        });

      }

      const arquivo = path.join(
        __dirname,
        "..",
        "cadastros",
        "clientes",
        "documentos",
        cliente.pastaDocumentos,
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

// ✅ EXPORTAR (SEMPRE ÚLTIMO)
module.exports = router;

