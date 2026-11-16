// controllers/userController.js

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const SECRET = "segredo_oficina";

exports.login = (req, res) => {
  const { nome, senha } = req.body;

  userModel.findUserByNome(nome, async (err, user) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro interno" });
    }

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    const valido = await bcrypt.compare(senha, user.senha);

    if (!valido) return res.status(401).json({ error: "Senha inválida" });
    const token = jwt.sign(
      { id: user.id, perfil: user.perfil },
      SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token });
  });
};