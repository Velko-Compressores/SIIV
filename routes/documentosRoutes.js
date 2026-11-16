// routes/documentosRoutes.js

const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middlewares/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ================= CONFIG UPLOAD =================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "documentos"));
  },
  filename: function (req, file, cb) {
    const nomeUnico = Date.now() + "-" + file.originalname;
    cb(null, nomeUnico);
  }
});

const upload = multer({ storage });

// ================= CREATE =================
router.post("/", auth, upload.single("arquivo"), (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ erro: "Arquivo não enviado" });
  }

  db.run(
    `INSERT INTO documentos (nome, tipo, caminho, dataHora, enviadoPor)
     VALUES (?, ?, ?, datetime('now'), ?)`,
    [
      file.originalname,
      file.mimetype,
      file.filename,
      req.body.enviadoPor
    ],
    function (err) {
      if (err) {
        console.error("❌ Erro ao salvar:", err);
        return res.status(500).json({ erro: "Erro ao salvar arquivo" });
      }

      res.json({
        sucesso: true,
        id: this.lastID
      });
    }
  );
});


// ================= READ (LISTAR + BUSCA) =================
router.get("/", auth, (req, res) => {
  const busca = req.query.nome || "";

  db.all(
    `SELECT id, nome, tipo, caminho, dataHora
     FROM documentos
     WHERE nome LIKE ?
     ORDER BY id DESC`,
    [`%${busca}%`],
    (err, rows) => {
      if (err) {
        console.error("❌ Erro ao listar:", err);
        return res.status(500).json({ erro: "Erro ao listar" });
      }

      res.json(rows);
    }
  );
});


// ================= READ (ABRIR DOCUMENTO) =================
router.get("/:id", auth, (req, res) => {

  db.get(
    "SELECT * FROM documentos WHERE id = ?",
    [req.params.id],
    (err, doc) => {

      if (err) {
        console.error(err);
        return res.status(500).json({ erro: "Erro interno" });
      }

      if (!doc) {
        return res.status(404).json({ erro: "Documento não encontrado" });
      }

      const caminhoArquivo = path.join(__dirname, "..", "documentos", doc.caminho);

      // ✅ valida se existe no disco
      if (!fs.existsSync(caminhoArquivo)) {
        return res.status(404).json({ erro: "Arquivo não encontrado no servidor" });
      }

      // ✅ envia arquivo corretamente
      res.sendFile(caminhoArquivo);
    }
  );
});


// ================= DELETE =================
router.delete("/:id", auth, (req, res) => {

  db.get("SELECT * FROM documentos WHERE id = ?", [req.params.id], (err, doc) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ erro: "Erro interno" });
    }

    if (!doc) {
      return res.status(404).json({ erro: "Documento não encontrado" });
    }

    const caminhoArquivo = path.join(__dirname, "..", "documentos", doc.caminho);

    // ✅ tenta apagar arquivo do disco
    fs.unlink(caminhoArquivo, (err) => {

      if (err) {
        console.warn("⚠️ Arquivo físico não encontrado ou já removido");
      } else {
        console.log("✅ Arquivo removido do disco");
      }

      // ✅ remove do banco
      db.run(
        "DELETE FROM documentos WHERE id = ?",
        [req.params.id],
        function (err) {

          if (err) {
            return res.status(500).json({ erro: "Erro ao deletar registro" });
          }

          res.json({
            sucesso: true,
            mensagem: "Documento removido"
          });
        }
      );

    });

  });

});


// ================= EXPORT =================
module.exports = router;