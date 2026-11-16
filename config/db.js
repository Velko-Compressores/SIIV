// config/db.js

const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

// ✅ CONEXÃO
const db = new sqlite3.Database("./database/db.sqlite", (err) => {
  if (err) {
    console.error("❌ Erro ao conectar:", err);
  } else {
    console.log("✅ Banco conectado");

    // ✅ Ativa validação das Foreign Keys
    db.run("PRAGMA foreign_keys = ON");
  }
});

// ✅ CRIAÇÃO DAS TABELAS
db.serialize(() => {

  // ================= USERS =================
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT UNIQUE NOT NULL,
      email TEXT,
      senha TEXT NOT NULL,
      perfil TEXT
    )
  `);

  // ================= CLIENTES ==============
  db.run(`
      CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        tipoPessoa TEXT,
        documento TEXT,
        nomePF TEXT,

        razaoSocial TEXT,
        nomeFantasia TEXT,
        inscricaoEstadual TEXT,
        inscricaoMunicipal TEXT,

        endereco TEXT,
        numero TEXT,
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
        emailEmpresa1 TEXT,

        nomeEmpresa2 TEXT,
        contatoEmpresa2 TEXT,
        telEmpresa2 TEXT,
        emailEmpresa2 TEXT,

        nomeEmpresa3 TEXT,
        contatoEmpresa3 TEXT,
        telEmpresa3 TEXT,
        emailEmpresa3 TEXT,

        dataHora TEXT,
        cadastradoPor TEXT,

        observacoes TEXT,

        pastaDocumentos TEXT,
        alvara TEXT,
        cartaoCnpj TEXT
      )
  `);

  // ================= DOCUMENTOS ==============
  db.run(`
    CREATE TABLE IF NOT EXISTS documentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      tipo TEXT,
      caminho TEXT,
      dataHora TEXT,
      enviadoPor TEXT
    )
  `);

  // ================= PRESTADORES ==============
  db.run(`
    CREATE TABLE IF NOT EXISTS prestadores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      razaoSocial TEXT,
      nomeFantasia TEXT,
      documento TEXT,

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

      banco TEXT,
      agencia TEXT,
      conta TEXT,
      chavePix TEXT,

      responsavel TEXT,
      telefoneResponsavel TEXT,
      emailResponsavel TEXT,

      comercial TEXT,
      telefoneComercial TEXT,
      emailComercial TEXT,

      financeiro TEXT,
      telefoneFinanceiro TEXT,
      emailFinanceiro TEXT,

      descricaoServico TEXT,

      pastaDocumentos TEXT,
      alvara TEXT,
      cartaoCnpj TEXT,

      dataHora TEXT,
      cadastradoPor TEXT
    )
  `);


  // ================= FORNECEDORES ==============
  db.run(`
    CREATE TABLE IF NOT EXISTS fornecedores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      razaoSocial TEXT,
      nomeFantasia TEXT,
      documento TEXT,

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

      banco TEXT,
      agencia TEXT,
      conta TEXT,
      chavePix TEXT,

      responsavel TEXT,
      telefoneResponsavel TEXT,
      emailResponsavel TEXT,

      comercial TEXT,
      telefoneComercial TEXT,
      emailComercial TEXT,

      financeiro TEXT,
      telefoneFinanceiro TEXT,
      emailFinanceiro TEXT,

      descricaoServico TEXT,

      pastaDocumentos TEXT,
      alvara TEXT,
      cartaoCnpj TEXT,

      dataHora TEXT,
      cadastradoPor TEXT
    )
  `);


  // ================= RECEBIMENTOS ==============
  db.run(`
    CREATE TABLE IF NOT EXISTS recebimentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      numeroOS TEXT UNIQUE,
      pastaFotos TEXT,
      clienteId INTEGER NOT NULL,

      nomeFantasia TEXT,
      razaoSocial TEXT,
      documento TEXT,

      garantia TEXT,
      notaFiscal TEXT,
      transporte TEXT,

      nomeSolicitante TEXT,
      telefoneSolicitante TEXT,
      emailSolicitante TEXT,

      fabricante TEXT,
      modelo TEXT,
      tensao TEXT,
      numeroSerie TEXT,
      tipo TEXT,

      foto1 TEXT,
      foto2 TEXT,
      foto3 TEXT,
      foto4 TEXT,
      foto5 TEXT,
      foto6 TEXT,

      foto7 TEXT,
      foto8 TEXT,
      foto9 TEXT,
      foto10 TEXT,
      foto11 TEXT,
      foto12 TEXT,

      dataHoraRecebimento TEXT,
      dataHoraLiberacao TEXT,
      recebidoPor TEXT,
      liberadoPor TEXT,

      status TEXT DEFAULT 'ATIVO',

      dataCriacao TEXT DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (clienteId)
      REFERENCES clientes(id)
    )
  `);


  // ================= DESMONTAGENS ==============
  db.run(`
    CREATE TABLE IF NOT EXISTS desmontagens (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      recebimentoId INTEGER NOT NULL UNIQUE,
      
      pastaFotos TEXT,

      numeroOS TEXT,
      nomeFantasia TEXT,
      fabricante TEXT,
      modelo TEXT,

      tensao TEXT,
      numeroSerie TEXT,
      tipo TEXT,

      desmontador TEXT,
      prioridade TEXT,

      liberadoPor TEXT,
      dataLiberacao TEXT,      

      status TEXT DEFAULT 'PRE-AGUARDANDO',
      situacao TEXT DEFAULT 'ATIVO',


      dataHoraInicio TEXT,
      dataHoraFim TEXT,

      tempoTotal TEXT,
      tempoCronometro TEXT,
      
      fotoRecebimento1 TEXT,
      fotoRecebimento2 TEXT,
      fotoRecebimento3 TEXT,
      fotoRecebimento4 TEXT,
      fotoRecebimento5 TEXT,
      fotoRecebimento6 TEXT,
      fotoRecebimento7 TEXT,
      fotoRecebimento8 TEXT,
      fotoRecebimento9 TEXT,
      fotoRecebimento10 TEXT,
      fotoRecebimento11 TEXT,
      fotoRecebimento12 TEXT,

      foto1 TEXT,
      foto2 TEXT,
      foto3 TEXT,
      foto4 TEXT,
      foto5 TEXT,
      foto6 TEXT,
      foto7 TEXT,
      foto8 TEXT,
      foto9 TEXT,
      foto10 TEXT,
      foto11 TEXT,
      foto12 TEXT,

      foto13 TEXT,
      foto14 TEXT,
      foto15 TEXT,
      foto16 TEXT,
      foto17 TEXT,
      foto18 TEXT,
      foto19 TEXT,
      foto20 TEXT,
      foto21 TEXT,
      foto22 TEXT,
      foto23 TEXT,
      foto24 TEXT,

      tempoPausadoTotal INTEGER DEFAULT 0,
      dataHoraPausa TEXT,
      cronometroPausado INTEGER DEFAULT 0,

      dataCriacao TEXT DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (recebimentoId)
      REFERENCES recebimentos(id)

    )
  `);  

  // ================= INSPECOES ==============
  db.run(`
      CREATE TABLE IF NOT EXISTS inspecoes (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        -- IDENTIFICAÇÃO DA OS
        recebimentoId INTEGER NOT NULL UNIQUE,
        numeroOS TEXT,

        -- DADOS DO EQUIPAMENTO
        nomeFantasia TEXT,

        fabricante TEXT,
        modelo TEXT,
        tensao TEXT,
        numeroSerie TEXT,
        tipo TEXT,

        -- PASTA DAS FOTOS
        pastaFotos TEXT,

        -- FOTOS DE RECEBIMENTO
        fotoRecebimento1 TEXT,
        fotoRecebimento2 TEXT,
        fotoRecebimento3 TEXT,
        fotoRecebimento4 TEXT,
        fotoRecebimento5 TEXT,
        fotoRecebimento6 TEXT,
        fotoRecebimento7 TEXT,
        fotoRecebimento8 TEXT,
        fotoRecebimento9 TEXT,
        fotoRecebimento10 TEXT,
        fotoRecebimento11 TEXT,
        fotoRecebimento12 TEXT,

        fotosRecebimentoSelecionadas TEXT
        DEFAULT '',

        comentarioRecebimento1 TEXT,
        comentarioRecebimento2 TEXT,
        comentarioRecebimento3 TEXT,
        comentarioRecebimento4 TEXT,
        comentarioRecebimento5 TEXT,
        comentarioRecebimento6 TEXT,
        comentarioRecebimento7 TEXT,
        comentarioRecebimento8 TEXT,
        comentarioRecebimento9 TEXT,
        comentarioRecebimento10 TEXT,
        comentarioRecebimento11 TEXT,
        comentarioRecebimento12 TEXT,

        -- FOTOS DA DESMONTAGEM
        foto1 TEXT,
        foto2 TEXT,
        foto3 TEXT,
        foto4 TEXT,
        foto5 TEXT,
        foto6 TEXT,
        foto7 TEXT,
        foto8 TEXT,
        foto9 TEXT,
        foto10 TEXT,
        foto11 TEXT,
        foto12 TEXT,

        foto13 TEXT,
        foto14 TEXT,
        foto15 TEXT,
        foto16 TEXT,
        foto17 TEXT,
        foto18 TEXT,
        foto19 TEXT,
        foto20 TEXT,
        foto21 TEXT,
        foto22 TEXT,
        foto23 TEXT,
        foto24 TEXT,

        fotosDesmontagemSelecionadas TEXT
        DEFAULT '',

        comentarioDesmontagem1 TEXT,
        comentarioDesmontagem2 TEXT,
        comentarioDesmontagem3 TEXT,
        comentarioDesmontagem4 TEXT,
        comentarioDesmontagem5 TEXT,
        comentarioDesmontagem6 TEXT,
        comentarioDesmontagem7 TEXT,
        comentarioDesmontagem8 TEXT,
        comentarioDesmontagem9 TEXT,
        comentarioDesmontagem10 TEXT,
        comentarioDesmontagem11 TEXT,
        comentarioDesmontagem12 TEXT,
        comentarioDesmontagem13 TEXT,
        comentarioDesmontagem14 TEXT,
        comentarioDesmontagem15 TEXT,
        comentarioDesmontagem16 TEXT,
        comentarioDesmontagem17 TEXT,
        comentarioDesmontagem18 TEXT,
        comentarioDesmontagem19 TEXT,
        comentarioDesmontagem20 TEXT,
        comentarioDesmontagem21 TEXT,
        comentarioDesmontagem22 TEXT,
        comentarioDesmontagem23 TEXT,
        comentarioDesmontagem24 TEXT,

        -- PROBLEMAS ENCONTRADOS
        problemasEncontrados TEXT,

        -- POSSÍVEIS CAUSAS DOS PROBLEMAS
        causasMecanicas TEXT DEFAULT '',

        causasEletricas TEXT DEFAULT '',

        -- RECOMENDAÇÕES PARA INSTALAÇÃO
        recomendacoesInstalacao TEXT DEFAULT '',

        -- OBSERVAÇÕES GERAIS DO INSPECIONADOR
        observacoesGerais TEXT,


        
        -- DADOS DA INSPEÇÃO
        inspecionador TEXT,

        prioridade TEXT,

        liberadoPor TEXT,
        dataLiberacao TEXT,

        -- CONTROLE DE TEMPO DA INSPEÇÃO
        dataHoraInicio TEXT,
        dataHoraFim TEXT,

        tempoTotal TEXT,
        tempoCronometro TEXT,

        tempoPausadoTotal INTEGER DEFAULT 0,
        cronometroPausado INTEGER DEFAULT 0,

        dataHoraPausa TEXT,

        -- CONTROLE DO FLUXO DA INSPEÇÃO
        status TEXT DEFAULT 'AGUARDANDO',
        situacao TEXT DEFAULT 'ATIVO',

        dataCriacao TEXT DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (recebimentoId)
        REFERENCES recebimentos(id)

      )
  `);



  // ================= INSPECAO PECAS ==============
  db.run(`
      CREATE TABLE IF NOT EXISTS inspecaoPecas (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        recebimentoId INTEGER NOT NULL,

        secao TEXT NOT NULL,

        descricao TEXT NOT NULL,

        quantidade INTEGER NOT NULL DEFAULT 1,

        observacao TEXT,

        dataCriacao TEXT DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (recebimentoId)
        REFERENCES recebimentos(id)

      )
  `);


  // ================= COMERCIAL ==============
  db.run(`
      CREATE TABLE IF NOT EXISTS comercial (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        recebimentoId INTEGER NOT NULL UNIQUE,

        numeroOS TEXT,
        nomeFantasia TEXT,
        fabricante TEXT,
        modelo TEXT,
        tipo TEXT,
        tensao TEXT,
        numeroSerie TEXT,

        status TEXT DEFAULT 'AGUARDANDO',
        situacao TEXT DEFAULT 'ATIVO',

        dataCriacao TEXT DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (recebimentoId)
        REFERENCES recebimentos(id)

      )
  `);


});

// ✅ USUÁRIOS PADRÃO (SEED)
const usuarios = [
  { nome: "ADMIN", email: "admin@admin.com", senha: "1234", perfil: "admin" },
  { nome: "MARCELO", email: "marcelo@empresa.com", senha: "456", perfil: "user" },
  { nome: "FELIPE", email: "felipe@empresa.com", senha: "123", perfil: "user" },
  { nome: "SABRINA", email: "sabrina@empresa.com", senha: "234", perfil: "user" },
  { nome: "CRISTINA", email: "cristina@empresa.com", senha: "345", perfil: "user" }
];

// ✅ CRIAÇÃO DOS USUÁRIOS (SEM DUPLICAR)
usuarios.forEach(async (u) => {

  db.get("SELECT * FROM users WHERE nome = ?", [u.nome], async (err, user) => {

    if (err) {
      console.error("❌ Erro ao buscar usuário:", err);
      return;
    }

    if (!user) {
      try {

        const hash = await bcrypt.hash(u.senha, 10);

        db.run(
          "INSERT INTO users (nome, email, senha, perfil) VALUES (?, ?, ?, ?)",
          [u.nome, u.email, hash, u.perfil],
          (err) => {
            if (err) {
              console.error("❌ Erro ao criar usuário:", err);
            } else {
              console.log(`✅ Usuário criado: ${u.nome}`);
            }
          }
        );

      } catch (err) {
        console.error("❌ Erro ao gerar hash:", err);
      }
    }

  });

});

// ✅ EXPORT
module.exports = db;

