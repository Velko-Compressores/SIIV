// app.js

const express = require("express");
const app = express();
require("./config/db");

const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const clientesRoutes = require("./routes/clientesRoutes");

const documentosRoutes = require("./routes/documentosRoutes");
const prestadoresRoutes = require("./routes/prestadoresRoutes");
const recebimentosRoutes = require("./routes/recebimentosRoutes");

const fornecedoresRoutes = require("./routes/fornecedoresRoutes");
const desmontagensRoutes = require("./routes/desmontagensRoutes");

const inspecoesRoutes = require("./routes/inspecoesRoutes");
const inspecaoPecasRoutes = require("./routes/inspecaoPecasRoutes");

const relatoriosRoutes = require("./routes/relatoriosRoutes");



app.use(express.json());
app.use(cors());

// ROTAS
app.use("/api/users", userRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/documentos", documentosRoutes);
app.use("/api/prestadores", prestadoresRoutes);
app.use("/api/recebimentos", recebimentosRoutes);

app.use("/api/fornecedores", fornecedoresRoutes);
app.use( "/api/desmontagens", desmontagensRoutes );

app.use( "/api/inspecoes", inspecoesRoutes );
app.use("/api/inspecaoPecas", inspecaoPecasRoutes);

app.use("/api/relatorios", relatoriosRoutes);

// FRONT
app.use(express.static("public"));

const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando: http://localhost:${PORT}`);
});




