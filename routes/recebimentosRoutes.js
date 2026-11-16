// routes/recebimentosRoutes.js

  const express = require("express");
  const router = express.Router();
  const db = require("../config/db");

  const auth = require("../middlewares/auth")

  const multer = require("multer");
  const path = require("path");
  const fs = require("fs");

  const PASTA_BASE_FOTOS = path.join(
    __dirname,
    "..",
    "producao",
    "recebimentos",
    "fotos"
  );

  fs.mkdirSync(
    PASTA_BASE_FOTOS,
    { recursive: true }
  );

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, PASTA_BASE_FOTOS);
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


  const upload = multer({
    storage
  });



  // ✅ CRIAR RECEBIMENTO
  router.post(
    "/",
    auth,
    upload.fields([
      { name: "foto1", maxCount: 1 },
      { name: "foto2", maxCount: 1 },
      { name: "foto3", maxCount: 1 },
      { name: "foto4", maxCount: 1 },
      { name: "foto5", maxCount: 1 },
      { name: "foto6", maxCount: 1 },

      { name: "foto7", maxCount: 1 },
      { name: "foto8", maxCount: 1 },
      { name: "foto9", maxCount: 1 },
      { name: "foto10", maxCount: 1 },
      { name: "foto11", maxCount: 1 },
      { name: "foto12", maxCount: 1 }   
    ]),
    (req, res) => {
    const recebimento = req.body;
    const foto1 =
      req.files?.foto1?.[0]?.filename || "";
    const foto2 =
      req.files?.foto2?.[0]?.filename || "";
    const foto3 =
      req.files?.foto3?.[0]?.filename || "";
    const foto4 =
      req.files?.foto4?.[0]?.filename || "";
    const foto5 =
      req.files?.foto5?.[0]?.filename || "";
    const foto6 =
      req.files?.foto6?.[0]?.filename || "";
    const foto7 =
      req.files?.foto7?.[0]?.filename || "";

    const foto8 =
      req.files?.foto8?.[0]?.filename || "";

    const foto9 =
      req.files?.foto9?.[0]?.filename || "";

    const foto10 =
      req.files?.foto10?.[0]?.filename || "";

    const foto11 =
      req.files?.foto11?.[0]?.filename || "";

    const foto12 =
      req.files?.foto12?.[0]?.filename || "";

    db.run(`
      INSERT INTO recebimentos (
        clienteId,

        nomeFantasia,
        razaoSocial,
        documento,

        garantia,
        notaFiscal,
        transporte,

        nomeSolicitante,
        telefoneSolicitante,
        emailSolicitante,

        fabricante,
        tipo,
        modelo,
        tensao,
        numeroSerie,

        foto1,
        foto2,
        foto3,
        foto4,
        foto5,
        foto6,

        foto7,
        foto8,
        foto9,
        foto10,
        foto11,
        foto12,

        dataHoraRecebimento,
        dataHoraLiberacao,

        recebidoPor,
        liberadoPor
        
      )
      VALUES (${Array(31).fill("?").join(",")})
    `,
    [

      recebimento.clienteId || "",

      recebimento.nomeFantasia || "",
      recebimento.razaoSocial || "",
      recebimento.documento || "",

      recebimento.garantia || "",
      recebimento.notaFiscal || "",
      recebimento.transporte || "",

      recebimento.nomeSolicitante || "",
      recebimento.telefoneSolicitante || "",
      recebimento.emailSolicitante || "",

      recebimento.fabricante || "",
      recebimento.tipo || "",
      recebimento.modelo || "",
      recebimento.tensao || "",
      recebimento.numeroSerie || "",

      foto1,
      foto2,
      foto3,
      foto4,
      foto5,
      foto6,

      foto7,
      foto8,
      foto9,
      foto10,
      foto11,
      foto12,      

      recebimento.dataHoraRecebimento || "",
      recebimento.dataHoraLiberacao || "",

      recebimento.recebidoPor || "",
      recebimento.liberadoPor || ""      

    ],
    function(err){

      if(err){
        console.error("❌ Erro ao salvar recebimento:", err);

        return res.status(500).json({
          erro: "Erro ao salvar recebimento"
        });
      }

      const id = this.lastID;

      const numeroOS =
        `OS-${String(id).padStart(6, "0")}`;

        const pastaRecebimento =
          `recebimento-${String(id).padStart(6, "0")}`;

        const pastaDestino = path.join(
          PASTA_BASE_FOTOS,
          pastaRecebimento
        );

        fs.mkdirSync(
          pastaDestino,
          { recursive: true }
        );

        const renomearFoto = (arquivoAtual, nomeNovo) => {

          if(!arquivoAtual){
            return "";
          }

          const extensao =
            path.extname(arquivoAtual);

          const novoNome =
            `${nomeNovo}${extensao}`;

          fs.renameSync(
            path.join(PASTA_BASE_FOTOS, arquivoAtual),
            path.join(pastaDestino, novoNome)
          );

          return novoNome;
        };    

        const novaFoto1 =
          renomearFoto(foto1, "foto-0001");

        const novaFoto2 =
          renomearFoto(foto2, "foto-0002");

        const novaFoto3 =
          renomearFoto(foto3, "foto-0003");

        const novaFoto4 =
          renomearFoto(foto4, "foto-0004");

        const novaFoto5 =
          renomearFoto(foto5, "foto-0005");

        const novaFoto6 =
          renomearFoto(foto6, "foto-0006");

        const novaFoto7 =
          renomearFoto(foto7, "foto-0007");

        const novaFoto8 =
          renomearFoto(foto8, "foto-0008");

        const novaFoto9 =
          renomearFoto(foto9, "foto-0009");

        const novaFoto10 =
          renomearFoto(foto10, "foto-0010");

        const novaFoto11 =
          renomearFoto(foto11, "foto-0011");

        const novaFoto12 =
          renomearFoto(foto12, "foto-0012");

      db.run(
        `
        UPDATE recebimentos
        SET
          numeroOS = ?,
          pastaFotos = ?,

          foto1 = ?,
          foto2 = ?,
          foto3 = ?,
          foto4 = ?,
          foto5 = ?,
          foto6 = ?,

          foto7 = ?,
          foto8 = ?,
          foto9 = ?,
          foto10 = ?,
          foto11 = ?,
          foto12 = ?
     
        WHERE id = ?
        `,
        [
          numeroOS,
          pastaRecebimento,

          novaFoto1,
          novaFoto2,
          novaFoto3,
          novaFoto4,
          novaFoto5,
          novaFoto6,

          novaFoto7,
          novaFoto8,
          novaFoto9,
          novaFoto10,
          novaFoto11,
          novaFoto12,          
          id
        ],
        (err) => {

          if(err){
            console.error("❌ Erro ao gerar OS:", err);

            return res.status(500).json({
              erro: "Erro ao gerar OS"
            });
          }

          const pastaDesmontagem =
            `desmontagem-${String(id).padStart(6,"0")}`;

          const pastaDesmontagemDestino =
            path.join(
              __dirname,
              "..",
              "producao",
              "desmontagens",
              "fotos",
              pastaDesmontagem
            );

          fs.mkdirSync(
            pastaDesmontagemDestino,
            { recursive:true }
          );

          const copiarFoto = (
            nomeFoto,
            numero
          ) => {

            if(!nomeFoto){
              return "";
            }

            const extensao =
              path.extname(nomeFoto);

            const novoNome =
              `foto_recebimento-${String(numero).padStart(4,"0")}${extensao}`;

            const origem =
              path.join(
                pastaDestino,
                nomeFoto
              );

            const destino =
              path.join(
                pastaDesmontagemDestino,
                novoNome
              );

            if(fs.existsSync(origem)){
              fs.copyFileSync(
                origem,
                destino
              );
            }

            return novoNome;
          };

          const fotosRecebimento = [

            copiarFoto(novaFoto1,1),
            copiarFoto(novaFoto2,2),
            copiarFoto(novaFoto3,3),
            copiarFoto(novaFoto4,4),
            copiarFoto(novaFoto5,5),
            copiarFoto(novaFoto6,6),

            copiarFoto(novaFoto7,7),
            copiarFoto(novaFoto8,8),
            copiarFoto(novaFoto9,9),
            copiarFoto(novaFoto10,10),
            copiarFoto(novaFoto11,11),
            copiarFoto(novaFoto12,12)

          ];

          db.run(
            `
            INSERT INTO desmontagens (

              recebimentoId,
              pastaFotos,

              numeroOS,
              nomeFantasia,
              fabricante,
              modelo,

              tensao,
              numeroSerie,
              tipo,

              status,
              situacao,

              fotoRecebimento1,
              fotoRecebimento2,
              fotoRecebimento3,
              fotoRecebimento4,
              fotoRecebimento5,
              fotoRecebimento6,

              fotoRecebimento7,
              fotoRecebimento8,
              fotoRecebimento9,
              fotoRecebimento10,
              fotoRecebimento11,
              fotoRecebimento12

            )
            VALUES (${Array(23).fill("?").join(",")})
            `,
            [
              id,
              pastaDesmontagem,

              numeroOS,
              recebimento.nomeFantasia || "",
              recebimento.fabricante || "",
              recebimento.modelo || "",

              recebimento.tensao || "",
              recebimento.numeroSerie || "",
              recebimento.tipo || "",

              "AGUARDANDO",
              "ATIVO",

              fotosRecebimento[0],
              fotosRecebimento[1],
              fotosRecebimento[2],
              fotosRecebimento[3],
              fotosRecebimento[4],
              fotosRecebimento[5],

              fotosRecebimento[6],
              fotosRecebimento[7],
              fotosRecebimento[8],
              fotosRecebimento[9],
              fotosRecebimento[10],
              fotosRecebimento[11]
            ],
            (err) => {

              if(err){

                console.error(
                  "❌ Erro ao criar desmontagem:",
                  err
                );

                return res.status(500).json({
                  erro:"Erro ao criar desmontagem"
                });

              }

              res.json({
                sucesso:true,
                id,
                numeroOS
              });

            }
          );

        }
      );

    });

  });

  // ✅ LISTAR RECEBIMENTOS
  router.get("/", auth, (req, res) => {
    db.all(
      `
      SELECT *
      FROM recebimentos
      WHERE status = 'ATIVO'
      ORDER BY id DESC
      `,
      [],
      (err, rows) => {

        if (err) {
          console.error(
            "❌ Erro ao listar recebimentos:",
            err
          );

          return res.status(500).json({
            erro: "Erro ao listar recebimentos"
          });
        }

        res.json(rows);

      }
    );

  });

  // ✅ LISTAR ARQUIVADOS
  router.get(
    "/arquivados/lista",
    auth,
    (req,res) => {

      db.all(
        `
        SELECT *
        FROM recebimentos
        WHERE status = 'ARQUIVADO'
        ORDER BY id DESC
        `,
        [],
        (err,rows) => {

          if(err){

            console.error(err);

            return res.status(500).json({
              erro:"Erro ao listar arquivados"
            });

          }

          res.json(rows);

        }
      );

    }
  );

  // ✅ BUSCAR RECEBIMENTO POR ID
  router.get("/:id", auth, (req, res) => {
    const { id } = req.params;

    db.get(
      `
      SELECT *
      FROM recebimentos
      WHERE id = ?
      `,
      [id],    
          
      (err, row) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            erro: "Erro ao buscar recebimento"
          });
        }

        if (!row) {
          return res.status(404).json({
            erro: "Recebimento não encontrado"
          });
        }

        res.json(row);

      }
    );
  });

  // ✅ VISUALIZAR FOTO 1
  router.get("/:id/foto1", auth, (req, res) => {
    const { id } = req.params;
    db.get(
      "SELECT foto1, pastaFotos FROM recebimentos WHERE id = ?",
      [id],
      (err, row) => {
        if(err){
          return res.status(500).json({
            erro: "Erro ao localizar foto"
          });
        }
        if(!row || !row.foto1){
          return res.status(404).json({
            erro: "Foto não encontrada"
          });
        }

        const arquivo = path.join(
          PASTA_BASE_FOTOS,
          row.pastaFotos,
          row.foto1
        )

        if(!fs.existsSync(arquivo)){
          return res.status(404).json({
            erro: "Arquivo da foto não encontrado"
          });
        }

        res.sendFile(arquivo);
      }
    );
  });

  // ✅ VISUALIZAR FOTO 2
  router.get("/:id/foto2", auth, (req, res) => {
    const { id } = req.params;
    db.get(
      "SELECT foto2, pastaFotos FROM recebimentos WHERE id = ?",
      [id],
      (err, row) => {
        if(err){
          return res.status(500).json({
            erro: "Erro ao localizar foto"
          });
        }
        if(!row || !row.foto2){
          return res.status(404).json({
            erro: "Foto não encontrada"
          });
        }

        const arquivo = path.join(
          PASTA_BASE_FOTOS,
          row.pastaFotos,
          row.foto2
        )

        if(!fs.existsSync(arquivo)){
          return res.status(404).json({
            erro: "Arquivo da foto não encontrado"
          });
        }

        res.sendFile(arquivo);
      }
    );
  });

  // ✅ VISUALIZAR FOTO 3
  router.get("/:id/foto3", auth, (req, res) => {
    const { id } = req.params;
    db.get(
      "SELECT foto3, pastaFotos FROM recebimentos WHERE id = ?",
      [id],
      (err, row) => {
        if(err){
          return res.status(500).json({
            erro: "Erro ao localizar foto"
          });
        }
        if(!row || !row.foto3){
          return res.status(404).json({
            erro: "Foto não encontrada"
          });
        }

        const arquivo = path.join(
          PASTA_BASE_FOTOS,
          row.pastaFotos,
          row.foto3
        )

        if(!fs.existsSync(arquivo)){
          return res.status(404).json({
            erro: "Arquivo da foto não encontrado"
          });
        }

        res.sendFile(arquivo);
      }
    );
  });

  // ✅ VISUALIZAR FOTO 4
  router.get("/:id/foto4", auth, (req, res) => {
    const { id } = req.params;
    db.get(
      "SELECT foto4, pastaFotos FROM recebimentos WHERE id = ?",
      [id],
      (err, row) => {
        if(err){
          return res.status(500).json({
            erro: "Erro ao localizar foto"
          });
        }
        if(!row || !row.foto4){
          return res.status(404).json({
            erro: "Foto não encontrada"
          });
        }

        const arquivo = path.join(
          PASTA_BASE_FOTOS,
          row.pastaFotos,
          row.foto4
        )

        if(!fs.existsSync(arquivo)){
          return res.status(404).json({
            erro: "Arquivo da foto não encontrado"
          });
        }

        res.sendFile(arquivo);
      }
    );
  });

  // ✅ VISUALIZAR FOTO 5
  router.get("/:id/foto5", auth, (req, res) => {
    const { id } = req.params;
    db.get(
      "SELECT foto5, pastaFotos FROM recebimentos WHERE id = ?",
      [id],
      (err, row) => {
        if(err){
          return res.status(500).json({
            erro: "Erro ao localizar foto"
          });
        }
        if(!row || !row.foto5){
          return res.status(404).json({
            erro: "Foto não encontrada"
          });
        }

        const arquivo = path.join(
          PASTA_BASE_FOTOS,
          row.pastaFotos,
          row.foto5
        )

        if(!fs.existsSync(arquivo)){
          return res.status(404).json({
            erro: "Arquivo da foto não encontrado"
          });
        }

        res.sendFile(arquivo);
      }
    );
  });

  // ✅ VISUALIZAR FOTO 6
  router.get("/:id/foto6", auth, (req, res) => {
    const { id } = req.params;
    db.get(
      "SELECT foto6, pastaFotos FROM recebimentos WHERE id = ?",
      [id],
      (err, row) => {
        if(err){
          return res.status(500).json({
            erro: "Erro ao localizar foto"
          });
        }
        if(!row || !row.foto6){
          return res.status(404).json({
            erro: "Foto não encontrada"
          });
        }

        const arquivo = path.join(
          PASTA_BASE_FOTOS,
          row.pastaFotos,
          row.foto6
        )

        if(!fs.existsSync(arquivo)){
          return res.status(404).json({
            erro: "Arquivo da foto não encontrado"
          });
        }

        res.sendFile(arquivo);
      }
    );
  });

  // ✅ VISUALIZAR FOTO 7
  router.get("/:id/foto7", auth, (req, res) => {
    const { id } = req.params;
    db.get(
      "SELECT foto7, pastaFotos FROM recebimentos WHERE id = ?",
      [id],
      (err, row) => {
        if(err){
          return res.status(500).json({
            erro: "Erro ao localizar foto"
          });
        }
        if(!row || !row.foto7){
          return res.status(404).json({
            erro: "Foto não encontrada"
          });
        }

        const arquivo = path.join(
          PASTA_BASE_FOTOS,
          row.pastaFotos,
          row.foto7
        )

        if(!fs.existsSync(arquivo)){
          return res.status(404).json({
            erro: "Arquivo da foto não encontrado"
          });
        }

        res.sendFile(arquivo);
      }
    );
  });

  // ✅ VISUALIZAR FOTO 8
  router.get("/:id/foto8", auth, (req, res) => {
    const { id } = req.params;
    db.get(
      "SELECT foto8, pastaFotos FROM recebimentos WHERE id = ?",
      [id],
      (err, row) => {
        if(err){
          return res.status(500).json({
            erro: "Erro ao localizar foto"
          });
        }
        if(!row || !row.foto8){
          return res.status(404).json({
            erro: "Foto não encontrada"
          });
        }

        const arquivo = path.join(
          PASTA_BASE_FOTOS,
          row.pastaFotos,
          row.foto8
        )

        if(!fs.existsSync(arquivo)){
          return res.status(404).json({
            erro: "Arquivo da foto não encontrado"
          });
        }

        res.sendFile(arquivo);
      }
    );
  });

  // ✅ VISUALIZAR FOTO 9
  router.get("/:id/foto9", auth, (req, res) => {
    const { id } = req.params;
    db.get(
      "SELECT foto9, pastaFotos FROM recebimentos WHERE id = ?",
      [id],
      (err, row) => {
        if(err){
          return res.status(500).json({
            erro: "Erro ao localizar foto"
          });
        }
        if(!row || !row.foto9){
          return res.status(404).json({
            erro: "Foto não encontrada"
          });
        }

        const arquivo = path.join(
          PASTA_BASE_FOTOS,
          row.pastaFotos,
          row.foto9
        )

        if(!fs.existsSync(arquivo)){
          return res.status(404).json({
            erro: "Arquivo da foto não encontrado"
          });
        }

        res.sendFile(arquivo);
      }
    );
  });

  // ✅ VISUALIZAR FOTO 10
  router.get("/:id/foto10", auth, (req, res) => {
    const { id } = req.params;
    db.get(
      "SELECT foto10, pastaFotos FROM recebimentos WHERE id = ?",
      [id],
      (err, row) => {
        if(err){
          return res.status(500).json({
            erro: "Erro ao localizar foto"
          });
        }
        if(!row || !row.foto10){
          return res.status(404).json({
            erro: "Foto não encontrada"
          });
        }

        const arquivo = path.join(
          PASTA_BASE_FOTOS,
          row.pastaFotos,
          row.foto10
        )

        if(!fs.existsSync(arquivo)){
          return res.status(404).json({
            erro: "Arquivo da foto não encontrado"
          });
        }

        res.sendFile(arquivo);
      }
    );
  });

  // ✅ VISUALIZAR FOTO 11
  router.get("/:id/foto11", auth, (req, res) => {
    const { id } = req.params;
    db.get(
      "SELECT foto11, pastaFotos FROM recebimentos WHERE id = ?",
      [id],
      (err, row) => {
        if(err){
          return res.status(500).json({
            erro: "Erro ao localizar foto"
          });
        }
        if(!row || !row.foto11){
          return res.status(404).json({
            erro: "Foto não encontrada"
          });
        }

        const arquivo = path.join(
          PASTA_BASE_FOTOS,
          row.pastaFotos,
          row.foto11
        )

        if(!fs.existsSync(arquivo)){
          return res.status(404).json({
            erro: "Arquivo da foto não encontrado"
          });
        }

        res.sendFile(arquivo);
      }
    );
  });

  // ✅ VISUALIZAR FOTO 12
  router.get("/:id/foto12", auth, (req, res) => {
    const { id } = req.params;
    db.get(
      "SELECT foto12, pastaFotos FROM recebimentos WHERE id = ?",
      [id],
      (err, row) => {
        if(err){
          return res.status(500).json({
            erro: "Erro ao localizar foto"
          });
        }
        if(!row || !row.foto12){
          return res.status(404).json({
            erro: "Foto não encontrada"
          });
        }

        const arquivo = path.join(
          PASTA_BASE_FOTOS,
          row.pastaFotos,
          row.foto12
        )

        if(!fs.existsSync(arquivo)){
          return res.status(404).json({
            erro: "Arquivo da foto não encontrado"
          });
        }

        res.sendFile(arquivo);
      }
    );
  });



  // ✅ ATUALIZAR RECEBIMENTO
    router.put(
      "/:id",
      auth,
      upload.fields([

      { name: "foto1", maxCount: 1 },
      { name: "foto2", maxCount: 1 },
      { name: "foto3", maxCount: 1 },
      { name: "foto4", maxCount: 1 },
      { name: "foto5", maxCount: 1 },
      { name: "foto6", maxCount: 1 },

      { name: "foto7", maxCount: 1 },
      { name: "foto8", maxCount: 1 },
      { name: "foto9", maxCount: 1 },
      { name: "foto10", maxCount: 1 },
      { name: "foto11", maxCount: 1 },
      { name: "foto12", maxCount: 1 }

    ]),
    (req, res) => {

      const id = req.params.id;
      const recebimento = req.body;

      const fotosRemovidas =
        JSON.parse(
          req.body.fotosRemovidas || "[]"
        );

      db.get(
        `
        SELECT
          pastaFotos,
          foto1,
          foto2,
          foto3,
          foto4,
          foto5,
          foto6,

          foto7,
          foto8,
          foto9,
          foto10,
          foto11,
          foto12          

        FROM recebimentos
        WHERE id = ?
        `,

        [id],
        (err, atual) => {

          if(err){
            return res.status(500).json({
              erro: "Erro ao buscar recebimento"
            });
          }

          fotosRemovidas.forEach(numero => {
            const campo = `foto${numero}`;
            const arquivo = atual[campo];
            if(!arquivo){
              return;
            }
            const caminho = path.join(
              PASTA_BASE_FOTOS,
              atual.pastaFotos,
              arquivo
            );
            try {
              if(fs.existsSync(caminho)){
                fs.unlinkSync(caminho);
              }
            } catch(err){
              console.error(
                `Erro ao remover ${campo}:`,
                err
              );
            }
          });

          const pastaDestino = path.join(
            PASTA_BASE_FOTOS,
            atual.pastaFotos
          );

          fs.mkdirSync(
            pastaDestino,
            { recursive: true }
          );

          const moverFotoNova = (
            arquivoTemporario,
            nomePadrao
          ) => {

            if(!arquivoTemporario){
              return null;
            }

            const extensao =
              path.extname(arquivoTemporario);

            const novoNome =
              `${nomePadrao}${extensao}`;

            fs.renameSync(
              path.join(
                PASTA_BASE_FOTOS,
                arquivoTemporario
              ),
              path.join(
                pastaDestino,
                novoNome
              )
            );
            return novoNome;
          };

        // Foto - 1  
        if(
          req.files?.foto1?.[0] &&
          atual?.foto1
        ){
          const antigo = path.join(
            PASTA_BASE_FOTOS,
            atual.pastaFotos,
            atual.foto1
          );
          try{
            if(fs.existsSync(antigo)){
              fs.unlinkSync(antigo);
            }
          }
          catch(err){
            console.error(
              "Erro ao apagar foto1 antiga:",
              err
            );
          }
        }
        const foto1 =
          fotosRemovidas.includes("1")
            ? ""
            : (
                req.files?.foto1?.[0]
                  ? moverFotoNova(
                      req.files.foto1[0].filename,
                      "foto-0001"
                    )
                  : (atual?.foto1 || "")
              );

        // Foto - 2  
        if(
          req.files?.foto2?.[0] &&
          atual?.foto2
        ){
          const antigo = path.join(
            PASTA_BASE_FOTOS,
            atual.pastaFotos,
            atual.foto2
          );
          try{
            if(fs.existsSync(antigo)){
              fs.unlinkSync(antigo);
            }
          }
          catch(err){
            console.error(
              "Erro ao apagar foto2 antiga:",
              err
            );
          }
        }
        const foto2 =
          fotosRemovidas.includes("2")
            ? ""
            : (
                req.files?.foto2?.[0]
                  ? moverFotoNova(
                      req.files.foto2[0].filename,
                      "foto-0002"
                    )
                  : (atual?.foto2 || "")
              );

        // Foto - 3  
        if(
          req.files?.foto3?.[0] &&
          atual?.foto3
        ){
          const antigo = path.join(
            PASTA_BASE_FOTOS,
            atual.pastaFotos,
            atual.foto3
          );
          try{
            if(fs.existsSync(antigo)){
              fs.unlinkSync(antigo);
            }
          }
          catch(err){
            console.error(
              "Erro ao apagar foto3 antiga:",
              err
            );
          }
        }
        const foto3 =
          fotosRemovidas.includes("3")
            ? ""
            : (
                req.files?.foto3?.[0]
                  ? moverFotoNova(
                      req.files.foto3[0].filename,
                      "foto-0003"
                    )
                  : (atual?.foto3 || "")
              );


        // Foto - 4  
        if(
          req.files?.foto4?.[0] &&
          atual?.foto4
        ){
          const antigo = path.join(
            PASTA_BASE_FOTOS,
            atual.pastaFotos,
            atual.foto4
          );
          try{
            if(fs.existsSync(antigo)){
              fs.unlinkSync(antigo);
            }
          }
          catch(err){
            console.error(
              "Erro ao apagar foto4 antiga:",
              err
            );
          }
        }
        const foto4 =
          fotosRemovidas.includes("4")
            ? ""
            : (
                req.files?.foto4?.[0]
                  ? moverFotoNova(
                      req.files.foto4[0].filename,
                      "foto-0004"
                    )
                  : (atual?.foto4 || "")
              );

        // Foto - 5  
        if(
          req.files?.foto5?.[0] &&
          atual?.foto5
        ){
          const antigo = path.join(
            PASTA_BASE_FOTOS,
            atual.pastaFotos,
            atual.foto5
          );
          try{
            if(fs.existsSync(antigo)){
              fs.unlinkSync(antigo);
            }
          }
          catch(err){
            console.error(
              "Erro ao apagar foto5 antiga:",
              err
            );
          }
        }
        const foto5 =
          fotosRemovidas.includes("5")
            ? ""
            : (
                req.files?.foto5?.[0]
                  ? moverFotoNova(
                      req.files.foto5[0].filename,
                      "foto-0005"
                    )
                  : (atual?.foto5 || "")
              );
 
        // Foto - 6  
        if(
          req.files?.foto6?.[0] &&
          atual?.foto6
        ){
          const antigo = path.join(
            PASTA_BASE_FOTOS,
            atual.pastaFotos,
            atual.foto6
          );
          try{
            if(fs.existsSync(antigo)){
              fs.unlinkSync(antigo);
            }
          }
          catch(err){
            console.error(
              "Erro ao apagar foto6 antiga:",
              err
            );
          }
        }
        const foto6 =
          fotosRemovidas.includes("6")
            ? ""
            : (
                req.files?.foto6?.[0]
                  ? moverFotoNova(
                      req.files.foto6[0].filename,
                      "foto-0006"
                    )
                  : (atual?.foto6 || "")
              );
            
 
        // Foto - 7  
        if(
          req.files?.foto7?.[0] &&
          atual?.foto7
        ){
          const antigo = path.join(
            PASTA_BASE_FOTOS,
            atual.pastaFotos,
            atual.foto7
          );
          try{
            if(fs.existsSync(antigo)){
              fs.unlinkSync(antigo);
            }
          }
          catch(err){
            console.error(
              "Erro ao apagar foto7 antiga:",
              err
            );
          }
        }
        const foto7 =
          fotosRemovidas.includes("7")
            ? ""
            : (
                req.files?.foto7?.[0]
                  ? moverFotoNova(
                      req.files.foto7[0].filename,
                      "foto-0007"
                    )
                  : (atual?.foto7 || "")
              );
 
 
        // Foto - 8  
        if(
          req.files?.foto8?.[0] &&
          atual?.foto8
        ){
          const antigo = path.join(
            PASTA_BASE_FOTOS,
            atual.pastaFotos,
            atual.foto8
          );
          try{
            if(fs.existsSync(antigo)){
              fs.unlinkSync(antigo);
            }
          }
          catch(err){
            console.error(
              "Erro ao apagar foto8 antiga:",
              err
            );
          }
        }
        const foto8 =
          fotosRemovidas.includes("8")
            ? ""
            : (
                req.files?.foto8?.[0]
                  ? moverFotoNova(
                      req.files.foto8[0].filename,
                      "foto-0008"
                    )
                  : (atual?.foto8 || "")
              );

 
        // Foto - 9  
        if(
          req.files?.foto9?.[0] &&
          atual?.foto9
        ){
          const antigo = path.join(
            PASTA_BASE_FOTOS,
            atual.pastaFotos,
            atual.foto9
          );
          try{
            if(fs.existsSync(antigo)){
              fs.unlinkSync(antigo);
            }
          }
          catch(err){
            console.error(
              "Erro ao apagar foto9 antiga:",
              err
            );
          }
        }
        const foto9 =
          fotosRemovidas.includes("9")
            ? ""
            : (
                req.files?.foto9?.[0]
                  ? moverFotoNova(
                      req.files.foto9[0].filename,
                      "foto-0009"
                    )
                  : (atual?.foto9 || "")
              );

 
        // Foto - 10  
        if(
          req.files?.foto10?.[0] &&
          atual?.foto10
        ){
          const antigo = path.join(
            PASTA_BASE_FOTOS,
            atual.pastaFotos,
            atual.foto10
          );
          try{
            if(fs.existsSync(antigo)){
              fs.unlinkSync(antigo);
            }
          }
          catch(err){
            console.error(
              "Erro ao apagar foto10 antiga:",
              err
            );
          }
        }
        const foto10 =
          fotosRemovidas.includes("10")
            ? ""
            : (
                req.files?.foto10?.[0]
                  ? moverFotoNova(
                      req.files.foto10[0].filename,
                      "foto-0010"
                    )
                  : (atual?.foto10 || "")
              );


        // Foto - 11  
        if(
          req.files?.foto11?.[0] &&
          atual?.foto11
        ){
          const antigo = path.join(
            PASTA_BASE_FOTOS,
            atual.pastaFotos,
            atual.foto11
          );
          try{
            if(fs.existsSync(antigo)){
              fs.unlinkSync(antigo);
            }
          }
          catch(err){
            console.error(
              "Erro ao apagar foto11 antiga:",
              err
            );
          }
        }
        const foto11 =
          fotosRemovidas.includes("11")
            ? ""
            : (
                req.files?.foto11?.[0]
                  ? moverFotoNova(
                      req.files.foto11[0].filename,
                      "foto-0011"
                    )
                  : (atual?.foto11 || "")
              );


        // Foto - 12  
        if(
          req.files?.foto12?.[0] &&
          atual?.foto12
        ){
          const antigo = path.join(
            PASTA_BASE_FOTOS,
            atual.pastaFotos,
            atual.foto12
          );
          try{
            if(fs.existsSync(antigo)){
              fs.unlinkSync(antigo);
            }
          }
          catch(err){
            console.error(
              "Erro ao apagar foto12 antiga:",
              err
            );
          }
        }
        const foto12 =
          fotosRemovidas.includes("12")
            ? ""
            : (
                req.files?.foto12?.[0]
                  ? moverFotoNova(
                      req.files.foto12[0].filename,
                      "foto-0012"
                    )
                  : (atual?.foto12 || "")
              );


          const values = [

            recebimento.clienteId || "",

            recebimento.nomeFantasia || "",
            recebimento.razaoSocial || "",
            recebimento.documento || "",

            recebimento.garantia || "",
            recebimento.notaFiscal || "",
            recebimento.transporte || "",

            recebimento.nomeSolicitante || "",
            recebimento.telefoneSolicitante || "",
            recebimento.emailSolicitante || "",

            recebimento.fabricante || "",
            recebimento.tipo || "",
            recebimento.modelo || "",
            recebimento.tensao || "",
            recebimento.numeroSerie || "",

            foto1,
            foto2,
            foto3,
            foto4,
            foto5,
            foto6,         

            foto7,
            foto8,
            foto9,
            foto10,
            foto11,
            foto12,
                         
            recebimento.dataHoraRecebimento || "",
            recebimento.dataHoraLiberacao || "",

            recebimento.recebidoPor || "",
            recebimento.liberadoPor || "",

            id

          ];

          db.run(
            `
            UPDATE recebimentos SET

              clienteId=?,

              nomeFantasia=?,
              razaoSocial=?,
              documento=?,

              garantia=?,
              notaFiscal=?,
              transporte=?,

              nomeSolicitante=?,
              telefoneSolicitante=?,
              emailSolicitante=?,

              fabricante=?,
              tipo=?,
              modelo=?,
              tensao=?,
              numeroSerie=?,

              foto1=?,
              foto2=?,
              foto3=?,
              foto4=?,
              foto5=?,
              foto6=?,

              foto7=?,
              foto8=?,
              foto9=?,
              foto10=?,
              foto11=?,
              foto12=?,

              dataHoraRecebimento=?,
              dataHoraLiberacao=?,

              recebidoPor=?,
              liberadoPor=?

            WHERE id=?
            `,
            values,
            function(err){

              if(err){
                console.error(err);

                return res.status(500).json({
                  erro: "Erro ao atualizar recebimento"
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


  // ✅ ARQUIVAR RECEBIMENTO
  router.put(
    "/:id/arquivar",
    auth,
    (req,res) => {

      const { id } = req.params;

      db.run(
        `
        UPDATE recebimentos
        SET status = 'ARQUIVADO'
        WHERE id = ?
        `,
        [id],
        function(err){

          if(err){

            console.error(err);

            return res.status(500).json({
              erro:"Erro ao arquivar recebimento"
            });

          }

          if(this.changes === 0){

            return res.status(404).json({
              erro:"Recebimento não encontrado"
            });

          }

          res.json({
            sucesso:true
          });

        }
      );

    }
  );

  // ✅ DESARQUIVAR RECEBIMENTO
  router.put(
    "/:id/desarquivar",
    auth,
    (req,res) => {

      const { id } = req.params;

      db.run(
        `
        UPDATE recebimentos
        SET status = 'ATIVO'
        WHERE id = ?
        `,
        [id],
        function(err){

          if(err){

            console.error(err);

            return res.status(500).json({
              erro:"Erro ao desarquivar recebimento"
            });

          }

          if(this.changes === 0){

            return res.status(404).json({
              erro:"Recebimento não encontrado"
            });

          }

          res.json({
            sucesso:true
          });

        }
      );

    }
  );


  // ✅ DELETAR RECEBIMENTO
  router.delete("/:id", auth, (req, res) => {
    const { id } = req.params;
    db.get(
      `
        SELECT
          pastaFotos
        FROM recebimentos
        WHERE id = ?
      `,
      [id],
      (err, recebimento) => {
        if(err){
          console.error(err);
          return res.status(500).json({
            erro: "Erro ao localizar recebimento"
          });
        }
        if(!recebimento){
          return res.status(404).json({
            erro: "Recebimento não encontrado"
          });
        }

        const pastaRecebimento = path.join(
          PASTA_BASE_FOTOS,
          recebimento.pastaFotos
        );

        try{
          fs.rmSync(
            pastaRecebimento,
            {
              recursive: true,
              force: true
            }
          );
        }
        catch(err){
          console.error(
            "Erro ao apagar pasta do recebimento:",
            err
          );
        }

        db.run(
          "DELETE FROM recebimentos WHERE id = ?",
          [id],
          function(err){
            if(err){
              console.error(err);
              return res.status(500).json({
                erro: "Erro ao deletar recebimento"
              });
            }
            if(this.changes === 0){
              return res.status(404).json({
                erro: "Recebimento não encontrado"
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

module.exports = router;

