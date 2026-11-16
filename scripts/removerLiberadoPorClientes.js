// scripts/removerLiberadoPorClientes.js

console.log("🚀 Removendo coluna liberadoPor...");

const db = require("../config/db");

db.serialize(() => {

  db.run(`
    CREATE TABLE clientes_nova (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      tipoPessoa TEXT,
      documento TEXT,
      nomePF TEXT,

      razaoSocial TEXT,
      nomeFantasia TEXT,
      inscricaoEstadual TEXT,
      inscricaoMunicipal TEXT,

      endereco TEXT,
      complemento TEXT,
      bairro TEXT,
      cidade TEXT,
      estado TEXT,
      pais TEXT,
      cep TEXT,

      telefone TEXT,
      celular TEXT,

      tributacao TEXT,
      icms TEXT,

      emailDanfe TEXT,
      emailCobranca TEXT,

      responsavel1 TEXT,
      telefoneResponsavel1 TEXT,
      emailResponsavel1 TEXT,

      responsavel2 TEXT,
      telefoneResponsavel2 TEXT,
      emailResponsavel2 TEXT,

      compras TEXT,
      telefoneCompras TEXT,
      emailCompras TEXT,

      areaTecnica TEXT,
      telefoneAreaTecnica TEXT,
      emailAreaTecnica TEXT,

      contasPagar TEXT,
      telefoneContasPagar TEXT,
      emailContasPagar TEXT,

      ramoAtividade TEXT,
      marcaCompressor TEXT,

      nomeEmpresa1 TEXT,
      contatoEmpresa1 TEXT,
      telEmpresa1 TEXT,

      nomeEmpresa2 TEXT,
      contatoEmpresa2 TEXT,
      telEmpresa2 TEXT,

      nomeEmpresa3 TEXT,
      contatoEmpresa3 TEXT,
      telEmpresa3 TEXT,

      dataHora TEXT,
      cadastradoPor TEXT,

      alvara TEXT,
      cartaoCnpj TEXT
    )
  `);

  db.run(`
    INSERT INTO clientes_nova (
      id,
      tipoPessoa,
      documento,
      nomePF,

      razaoSocial,
      nomeFantasia,
      inscricaoEstadual,
      inscricaoMunicipal,

      endereco,
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

      nomeEmpresa2,
      contatoEmpresa2,
      telEmpresa2,

      nomeEmpresa3,
      contatoEmpresa3,
      telEmpresa3,

      dataHora,
      cadastradoPor,

      alvara,
      cartaoCnpj
    )

    SELECT
      id,
      tipoPessoa,
      documento,
      nomePF,

      razaoSocial,
      nomeFantasia,
      inscricaoEstadual,
      inscricaoMunicipal,

      endereco,
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

      nomeEmpresa2,
      contatoEmpresa2,
      telEmpresa2,

      nomeEmpresa3,
      contatoEmpresa3,
      telEmpresa3,

      dataHora,
      cadastradoPor,

      alvara,
      cartaoCnpj

    FROM clientes
  `);

  db.run(`DROP TABLE clientes`);
  db.run(`ALTER TABLE clientes_nova RENAME TO clientes`);

  db.all(
    "PRAGMA table_info(clientes)",
    [],
    (err, rows) => {

      if (err) {
        console.error(err);
        process.exit(1);
      }

      console.log("\n📋 Estrutura final:");

      rows.forEach(c => {
        console.log("-", c.name);
      });

      db.close(() => {
        console.log("\n✅ Coluna liberadoPor removida.");
        process.exit(0);
      });
    }
  );

});