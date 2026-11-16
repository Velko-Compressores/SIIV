const express = require("express");
const router = express.Router();

const {
    gerarPdf
} = require("../controllers/relatorioController");

router.get("/:id/pdf", gerarPdf);

module.exports = router;