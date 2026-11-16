// routes/desmontagensRoutes.js

const express = require("express");
const router = express.Router();
const db = require("../config/db");

const auth = require("../middlewares/auth");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const PASTA_BASE_FOTOS = path.join(
  __dirname,
  "..",
  "producao",
  "desmontagens",
  "fotos"
);

const PASTA_BASE_FOTOS_RECEBIMENTO = path.join(
  __dirname,
  "..",
  "producao",
  "recebimentos",
  "fotos"
);

const PASTA_BASE_FOTOS_INSPECAO = path.join(
  __dirname,
  "..",
  "producao",
  "inspecoes",
  "fotos"
);


fs.mkdirSync(
  PASTA_BASE_FOTOS,
  { recursive:true }
);

fs.mkdirSync(
  PASTA_BASE_FOTOS_INSPECAO,
  { recursive:true }
);



const storage = multer.diskStorage({

  destination(req,file,cb){
    cb(null, PASTA_BASE_FOTOS);
  },

  filename(req,file,cb){

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


router.delete(
  "/:id/foto/:numero",
  auth,
  (req,res) => {

    const id = req.params.id;
    const numero = parseInt(req.params.numero);

    if(numero < 1 || numero > 24){
      return res.status(400).json({
        erro:"Foto inválida"
      });
    }

    db.get(
      `
      SELECT
        foto${numero} as foto,
        pastaFotos,
        status
      FROM desmontagens
      WHERE recebimentoId = ?
      `,
      [id],
      (err,desmontagem) => {

        if(err){
          return res.status(500).json({
            erro:"Erro ao localizar desmontagem"
          });
        }

        if(!desmontagem){
          return res.status(404).json({
            erro:"Desmontagem não encontrada"
          });
        }

        if(
          desmontagem.status ===
          "FINALIZADA"
        ){
          return res.status(400).json({
            erro:"Desmontagem finalizada."
          });
        }

        if(
          desmontagem.foto &&
          desmontagem.pastaFotos
        ){

          const arquivo =
            path.join(
              PASTA_BASE_FOTOS,
              desmontagem.pastaFotos,
              desmontagem.foto
            );

          if(fs.existsSync(arquivo)){
            fs.unlinkSync(arquivo);
          }

        }

        db.run(
          `
          UPDATE desmontagens
          SET foto${numero}=NULL
          WHERE recebimentoId = ?
          `,
          [id],
          function(err){

            if(err){
              return res.status(500).json({
                erro:"Erro ao remover foto"
              });
            }

            res.json({
              sucesso:true
            });

          }
        );

      }
    );

  }
);



router.delete(
  "/:id/foto-recebimento/:numero",
  auth,
  (req,res) => {

    const id = req.params.id;
    const numero = parseInt(req.params.numero);

    if(numero < 1 || numero > 12){
      return res.status(400).json({
        erro:"Foto inválida"
      });
    }

    db.get(
      `
      SELECT
        fotoRecebimento${numero} as foto,
        pastaFotos,
        status
      FROM desmontagens
      WHERE recebimentoId = ?
      `,
      [id],
      (err,desmontagem) => {

        if(err){
          return res.status(500).json({
            erro:"Erro ao localizar desmontagem"
          });
        }

        if(!desmontagem){
          return res.status(404).json({
            erro:"Desmontagem não encontrada"
          });
        }

        if(
          desmontagem.status ===
          "FINALIZADA"
        ){
          return res.status(400).json({
            erro:"Desmontagem finalizada."
          });
        }

        if(
          desmontagem.foto &&
          desmontagem.pastaFotos
        ){

          const arquivo = path.join(
            PASTA_BASE_FOTOS,
            desmontagem.pastaFotos,
            desmontagem.foto
          );

          if(fs.existsSync(arquivo)){
            fs.unlinkSync(arquivo);
          }

        }

        db.run(
          `
          UPDATE desmontagens
          SET fotoRecebimento${numero}=NULL
          WHERE recebimentoId = ?
          `,
          [id],
          function(err){

            if(err){
              return res.status(500).json({
                erro:"Erro ao remover foto"
              });
            }

            res.json({
              sucesso:true
            });

          }
        );

      }
    );

  }
);


// ✅ SALVAR UMA PROGRAMAÇÃO
router.post(
  "/programacao",
  auth,
  (req, res) => {

    const item = req.body;

    db.get(
      `
      SELECT id
      FROM desmontagens
      WHERE recebimentoId = ?
      `,
      [item.recebimentoId],
      (err, existente) => {

        if (err) {
          console.error(err);

          return res.status(500).json({
            erro: "Erro ao verificar programação"
          });
        }

        // UPDATE
        if (existente) {

          db.run(
            `
            UPDATE desmontagens
            SET
              desmontador = ?,
              prioridade = ?,
              liberadoPor = ?,
              dataLiberacao = ?,
              status = 'AGUARDANDO'
            WHERE recebimentoId = ?
            `,
            [
              item.desmontador,
              item.prioridade,
              item.liberadoPor,
              item.dataLiberacao,
              item.recebimentoId
            ],
            function(err){

              if(err){
                console.error(err);

                return res.status(500).json({
                  erro: "Erro ao atualizar programação"
                });
              }

              res.json({
                sucesso:true
              });

            }
          );
        }

        // INSERT
        else {
            db.get(
            `
            SELECT *
            FROM recebimentos
            WHERE id = ?
            `,
            [item.recebimentoId],
            (err, recebimento) => {

              if(err){
                return res.status(500).json({
                  erro:"Erro ao localizar recebimento"
                });
              }

              if(!recebimento){
                return res.status(404).json({
                  erro:"Recebimento não encontrado"
                });
              }

              const pastaDesmontagem =
                `desmontagem-${String(item.recebimentoId).padStart(6,"0")}`;

              const pastaOrigem = path.join(
                PASTA_BASE_FOTOS_RECEBIMENTO,
                recebimento.pastaFotos
              );

              const pastaDestino = path.join(
                PASTA_BASE_FOTOS,
                pastaDesmontagem
              );

              fs.mkdirSync(
                pastaDestino,
                { recursive:true }
              );

              const fotosRecebimento = [];

              for(let i = 1; i <= 12; i++){

                const nomeOriginal =
                  recebimento[`foto${i}`];

                if(!nomeOriginal){

                  fotosRecebimento.push(null);

                  continue;
                }

                const extensao =
                  path.extname(nomeOriginal);

                const novoNome =
                  `foto_recebimento-${String(i).padStart(4,"0")}${extensao}`;

                const origem = path.join(
                  pastaOrigem,
                  nomeOriginal
                );

                const destino = path.join(
                  pastaDestino,
                  novoNome
                );

                if(fs.existsSync(origem)){

                  fs.copyFileSync(
                    origem,
                    destino
                  );

                }

                fotosRecebimento.push(
                  novoNome
                );

              }

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

                  desmontador,
                  prioridade,
                  liberadoPor,
                  dataLiberacao,
                  status,

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
                  fotoRecebimento12,

                )
                VALUES (${Array(26).fill("?").join(",")})
                `,
                [
                  item.recebimentoId,
                  pastaDesmontagem,

                  item.numeroOS,
                  item.nomeFantasia,
                  item.fabricante,
                  item.modelo,

                  recebimento.tensao,
                  recebimento.numeroSerie,
                  recebimento.tipo,

                  item.desmontador,
                  item.prioridade,
                  item.liberadoPor,
                  item.dataLiberacao,
                  "AGUARDANDO",

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
                function(err){

                  if(err){
                    console.error(err);

                    return res.status(500).json({
                      erro:"Erro ao inserir programação"
                    });
                  }

                  res.json({
                    sucesso:true
                  });

                }
              );

            });


        }

      }
    );

  }
);


// ✅ SALVAR PROGRAMAÇÕES
router.post(
  "/programacoes",
  auth,
  (req, res) => {

    const programacoes = req.body;

    if (!Array.isArray(programacoes)) {
      return res.status(400).json({
        erro: "Dados inválidos"
      });
    }

    if (programacoes.length === 0) {
      return res.json({
        sucesso: true
      });
    }

    let processados = 0;

    const finalizar = (err) => {

      if (err) {
        console.error(err);

        return res.status(500).json({
          erro: "Erro ao salvar programação"
        });
      }

      processados++;

      if (processados === programacoes.length) {
        res.json({
          sucesso: true
        });
      }
    };

    programacoes.forEach(item => {

      db.get(
        `
        SELECT id
        FROM desmontagens
        WHERE recebimentoId = ?
        `,
        [item.recebimentoId],
        (err, existente) => {

          if (err) {
            console.error(err);

            return res.status(500).json({
              erro: "Erro ao verificar programação"
            });
          }

          // ✅ UPDATE
          if (existente) {

            const values = [
              item.desmontador || "",
              item.prioridade || "",
              item.liberadoPor || "",
              item.dataLiberacao || "",
              item.recebimentoId
            ];

            db.run(
              `
              UPDATE desmontagens
              SET
                desmontador = ?,
                prioridade = ?,
                liberadoPor = ?,
                dataLiberacao = ?
              WHERE recebimentoId = ?
              `,
              values,
              finalizar
            );

          }

          // ✅ INSERT
          else {

            const values = [

              item.recebimentoId,
              item.numeroOS || "",
              item.nomeFantasia || "",
              item.fabricante || "",
              item.modelo || "",

              item.tensao || "",
              item.numeroSerie || "",
              item.tipo || "",

              item.desmontador || "",
              item.prioridade || "",
              item.liberadoPor || "",
              item.dataLiberacao || "",

              "AGUARDANDO"

            ];

            db.run(
              `
              INSERT INTO desmontagens (
                recebimentoId,
                numeroOS,
                nomeFantasia,
                fabricante,
                modelo,
                tensao,
                numeroSerie,
                tipo,                
                desmontador,
                prioridade,
                liberadoPor,
                dataLiberacao,
                status
              )
              VALUES (${Array(values.length).fill("?").join(",")})
              `,
              values,
              finalizar
            );
          }

        }
      );

    });

  }
);


// ✅ LISTAR DESMONTAGENS
router.get(
  "/",
  auth,
  (req, res) => {

    db.all(
      `
      SELECT *
      FROM desmontagens
      ORDER BY id DESC
      `,
      [],
      (err, rows) => {

        if (err) {

          console.error(err);

          return res.status(500).json({
            erro: "Erro ao listar desmontagens"
          });
        }

        res.json(rows);
      }
    );

  }
);

// ✅ INICIAR DESMONTAGEM
router.put(
  "/iniciar/:id",
  auth,
  (req, res) => {

    const { id } = req.params;

    db.run(
      `
      UPDATE desmontagens
      SET
        status = 'EM DESMONTAGEM',
        dataHoraInicio = ?
      WHERE id = ?
      `,
      [
        new Date().toISOString(),
        id
      ],
      function(err){

        if(err){
          console.error(err);

          return res.status(500).json({
            erro: "Erro ao iniciar desmontagem"
          });
        }

        if(this.changes === 0){
          return res.status(404).json({
            erro: "Desmontagem não encontrada"
          });
        }

        res.json({
          sucesso: true
        });

      }
    );

  }
);

// ✅ FINALIZAR DESMONTAGEM
router.put(
  "/finalizar/:id",
  auth,
  (req, res) => {

    const { id } = req.params;

    db.get(
      `
      SELECT *
      FROM desmontagens
      WHERE id = ?
      `,
      [id],
      (err, desmontagem) => {

        if(err){
          console.error(err);

          return res.status(500).json({
            erro: "Erro ao localizar desmontagem"
          });
        }

        if(!desmontagem){
          return res.status(404).json({
            erro: "Desmontagem não encontrada"
          });
        }

        // Se estiver pausada no momento da finalização
        if(
          desmontagem.cronometroPausado &&
          desmontagem.dataHoraPausa
        ){

          const inicioPausa =
            new Date(
              desmontagem.dataHoraPausa
            );

          const fimPausa =
            new Date();

          const segundosPausados =
            Math.floor(
              (fimPausa - inicioPausa) / 1000
            );

          desmontagem.tempoPausadoTotal =
            (desmontagem.tempoPausadoTotal || 0)
            + segundosPausados;

        }

        const dataHoraFim =
          new Date().toISOString();

        let tempoTotal = "";
        let tempoCronometro = "";

        if (desmontagem.dataHoraInicio) {

          const inicio =
            new Date(desmontagem.dataHoraInicio);

          const fim =
            new Date(dataHoraFim);

          // TEMPO TOTAL
          const diferencaTotal =
            fim - inicio;

          const minutosTotal =
            Math.floor(
              diferencaTotal / 1000 / 60
            );

          const horasTotal =
            Math.floor(
              minutosTotal / 60
            );

          const minutosRestantesTotal =
            minutosTotal % 60;

          tempoTotal =
            `${horasTotal}h ${minutosRestantesTotal}min`;

          // TEMPO CRONÔMETRO
          const diferencaCronometro =
            diferencaTotal -
            ((desmontagem.tempoPausadoTotal || 0) * 1000);

          const minutosCronometro =
            Math.floor(
              diferencaCronometro / 1000 / 60
            );

          const horasCronometro =
            Math.floor(
              minutosCronometro / 60
            );

          const minutosRestantesCronometro =
            minutosCronometro % 60;

          tempoCronometro =
            `${horasCronometro}h ${minutosRestantesCronometro}min`;
        }

        db.run(
          `
          UPDATE desmontagens
          SET
            status = 'FINALIZADA',
            dataHoraFim = ?,
            tempoTotal = ?,
            tempoCronometro = ?,
            tempoPausadoTotal = ?,
            cronometroPausado = 0,
            dataHoraPausa = NULL
          WHERE id = ?
          `,
          [
            dataHoraFim,
            tempoTotal,
            tempoCronometro,
            desmontagem.tempoPausadoTotal || 0,
            id
          ],
          function(err){

            if(err){
              console.error(err);

              return res.status(500).json({
                erro:"Erro ao finalizar desmontagem"
              });
            }

            db.get(
              `
              SELECT id
              FROM inspecoes
              WHERE recebimentoId = ?
              `,
              [desmontagem.recebimentoId],
            
              (err, inspecaoExistente) => {

                if(err){
                  console.error(err);

                  return res.status(500).json({
                    erro:"Erro ao verificar inspeção"
                  });
                }

                if(inspecaoExistente){

                  return res.json({
                    sucesso:true
                  });

                }

              const pastaInspecao =
                `inspecao-${String(
                  desmontagem.recebimentoId
                ).padStart(6, "0")}`;

              const pastaOrigem = path.join(
                PASTA_BASE_FOTOS,
                desmontagem.pastaFotos
              );

              const pastaDestino = path.join(
                PASTA_BASE_FOTOS_INSPECAO,
                pastaInspecao
              );

              fs.mkdirSync(
                pastaDestino,
                { recursive:true }
              );

              if(fs.existsSync(pastaOrigem)){

                for(const arquivo of fs.readdirSync(pastaOrigem)){

                  fs.copyFileSync(
                    path.join(pastaOrigem, arquivo),
                    path.join(pastaDestino, arquivo)
                  );

                }

              }

                db.run(
                  `
                INSERT INTO inspecoes (

                  recebimentoId,

                  pastaFotos,

                  numeroOS,
                  nomeFantasia,
                  fabricante,
                  modelo,

                  tensao,
                  numeroSerie,
                  tipo,


                  liberadoPor,
                  dataLiberacao,

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
                  fotoRecebimento12,

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

                  foto13,
                  foto14,
                  foto15,
                  foto16,
                  foto17,
                  foto18,
                  foto19,
                  foto20,
                  foto21,
                  foto22,
                  foto23,
                  foto24,

                  status
                  )
                  VALUES (${Array(48).fill("?").join(",")})
                  `,

                  [
                    desmontagem.recebimentoId,

                    pastaInspecao,

                    desmontagem.numeroOS,
                    desmontagem.nomeFantasia,
                    desmontagem.fabricante,
                    desmontagem.modelo,

                    desmontagem.tensao,
                    desmontagem.numeroSerie,
                    desmontagem.tipo,

                    desmontagem.liberadoPor,
                    desmontagem.dataLiberacao,

                    desmontagem.fotoRecebimento1,
                    desmontagem.fotoRecebimento2,
                    desmontagem.fotoRecebimento3,
                    desmontagem.fotoRecebimento4,
                    desmontagem.fotoRecebimento5,
                    desmontagem.fotoRecebimento6,
                    desmontagem.fotoRecebimento7,
                    desmontagem.fotoRecebimento8,
                    desmontagem.fotoRecebimento9,
                    desmontagem.fotoRecebimento10,
                    desmontagem.fotoRecebimento11,
                    desmontagem.fotoRecebimento12,

                    desmontagem.foto1,
                    desmontagem.foto2,
                    desmontagem.foto3,
                    desmontagem.foto4,
                    desmontagem.foto5,
                    desmontagem.foto6,
                    desmontagem.foto7,
                    desmontagem.foto8,
                    desmontagem.foto9,
                    desmontagem.foto10,
                    desmontagem.foto11,
                    desmontagem.foto12,

                    desmontagem.foto13,
                    desmontagem.foto14,
                    desmontagem.foto15,
                    desmontagem.foto16,
                    desmontagem.foto17,
                    desmontagem.foto18,
                    desmontagem.foto19,
                    desmontagem.foto20,
                    desmontagem.foto21,
                    desmontagem.foto22,
                    desmontagem.foto23,
                    desmontagem.foto24,

                    "AGUARDANDO"

                  ],                

                  function(err){

                    if(err){
                      console.error(err);

                      return res.status(500).json({
                        erro:"Erro ao criar inspeção"
                      });
                    }

                    res.json({
                      sucesso:true
                    });

                  }
                );

              }
            );

          }
        );

      }
    );

  }
);

// ✅ OBTER DESMONTAGEM
router.get(
  "/:recebimentoId",
  auth,
  (req,res)=>{

    db.get(
      `
      SELECT *
      FROM desmontagens
      WHERE recebimentoId = ?
      `,
      [req.params.recebimentoId],
      (err,row)=>{

        if(err){
          console.error(err);

          return res.status(500).json({
            erro:"Erro ao consultar desmontagem"
          });
        }

        if(!row){
          return res.status(404).json({
            erro:"Desmontagem não encontrada"
          });
        }

        res.json(row);

      }
    );

  }
);

// ✅ PAUSAR DESMONTAGEM
router.put(
  "/pausar/:id",
  auth,
  (req, res) => {

    const { id } = req.params;

    db.run(
      `
      UPDATE desmontagens
      SET
        cronometroPausado = 1,
        dataHoraPausa = ?
      WHERE id = ?
      `,
      [
        new Date().toISOString(),
        id
      ],
      function(err){

        if(err){
          console.error(err);

          return res.status(500).json({
            erro:"Erro ao pausar desmontagem"
          });
        }

        res.json({
          sucesso:true
        });

      }
    );

  }
);

// ✅ RETOMAR DESMONTAGEM
router.put(
  "/retomar/:id",
  auth,
  (req, res) => {

    const { id } = req.params;

    db.get(
      `
      SELECT *
      FROM desmontagens
      WHERE id = ?
      `,
      [id],
      (err, desmontagem) => {

        if(err){
          console.error(err);

          return res.status(500).json({
            erro:"Erro ao localizar desmontagem"
          });
        }

        if(!desmontagem){
          return res.status(404).json({
            erro:"Desmontagem não encontrada"
          });
        }

        if(!desmontagem.dataHoraPausa){

          return res.json({
            sucesso:true
          });

        }

        const inicioPausa =
          new Date(desmontagem.dataHoraPausa);

        const fimPausa =
          new Date();

        const segundosPausados =
          Math.floor(
            (fimPausa - inicioPausa) / 1000
          );

        const totalPausado =
          (desmontagem.tempoPausadoTotal || 0)
          + segundosPausados;

        db.run(
          `
          UPDATE desmontagens
          SET
            tempoPausadoTotal = ?,
            cronometroPausado = 0,
            dataHoraPausa = NULL
          WHERE id = ?
          `,
          [
            totalPausado,
            id
          ],
          function(err){

            if(err){
              console.error(err);

              return res.status(500).json({
                erro:"Erro ao retomar desmontagem"
              });
            }

            res.json({
              sucesso:true
            });

          }
        );

      }
    );

  }
);

router.post(
  "/:recebimentoId/fotos",
  auth,
  upload.fields([
    { name:"foto1", maxCount:1 },
    { name:"foto2", maxCount:1 },
    { name:"foto3", maxCount:1 },
    { name:"foto4", maxCount:1 },
    { name:"foto5", maxCount:1 },
    { name:"foto6", maxCount:1 },
    { name:"foto7", maxCount:1 },
    { name:"foto8", maxCount:1 },
    { name:"foto9", maxCount:1 },
    { name:"foto10", maxCount:1 },
    { name:"foto11", maxCount:1 },
    { name:"foto12", maxCount:1 },

    { name:"foto13", maxCount:1 },
    { name:"foto14", maxCount:1 },
    { name:"foto15", maxCount:1 },
    { name:"foto16", maxCount:1 },
    { name:"foto17", maxCount:1 },
    { name:"foto18", maxCount:1 },
    { name:"foto19", maxCount:1 },
    { name:"foto20", maxCount:1 },
    { name:"foto21", maxCount:1 },
    { name:"foto22", maxCount:1 },
    { name:"foto23", maxCount:1 },
    { name:"foto24", maxCount:1 }
      
  ]),
  (req,res) => {

    const campos = [];

    const valores = [];

    for(let i=1;i<=24;i++){

      if(req.files[`foto${i}`]){

        campos.push(`foto${i}=?`);

        valores.push(
          req.files[`foto${i}`][0].filename
        );

      }

    }

    if(campos.length === 0){

      return res.json({
        sucesso:true
      });

    }

//--------------
db.get(
  `
  SELECT *
  FROM desmontagens
  WHERE recebimentoId = ?
  `,
  [req.params.recebimentoId],
  (err, desmontagem) => {

    if(err){
      console.error(err);

      return res.status(500).json({
        erro:"Erro ao localizar desmontagem"
      });
    }

    if(!desmontagem){

      return res.status(404).json({
        erro:"Desmontagem não encontrada"
      });

    }

    const pastaFotos =
      desmontagem.pastaFotos;

    const pastaDestino = path.join(
      PASTA_BASE_FOTOS,
      pastaFotos
    );

    fs.mkdirSync(
      pastaDestino,
      { recursive:true }
    );

    const novosCampos = [];
    const novosValores = [];

    for(let i=1;i<=24;i++){

      const arquivo =
        req.files?.[`foto${i}`]?.[0];

      if(!arquivo){
        continue;
      }

      const extensao =
        path.extname(
          arquivo.filename
        );

      const novoNome =
        `foto_desmontagem-${String(i).padStart(4,"0")}${extensao}`;

      const destinoFinal =
        path.join(
          pastaDestino,
          novoNome
        );

      if(
        fs.existsSync(destinoFinal)
      ){
        fs.unlinkSync(destinoFinal);
      }

      fs.renameSync(
        path.join(
          PASTA_BASE_FOTOS,
          arquivo.filename
        ),
        destinoFinal
      );

      novosCampos.push(
        `foto${i}=?`
      );

      novosValores.push(
        novoNome
      );

    }

    novosCampos.push(
      "pastaFotos=?"
    );

    novosValores.push(
      pastaFotos
    );

    novosValores.push(
      req.params.recebimentoId
    );

    db.run(
      `
      UPDATE desmontagens
      SET ${novosCampos.join(",")}
      WHERE recebimentoId = ?
      `,
      novosValores,
      function(err){

        if(err){
          console.error(err);

          return res.status(500).json({
            erro:"Erro ao salvar fotos"
          });
        }

        res.json({
          sucesso:true
        });

      }
    );

  }
);

    

  }
);

router.get(
  "/:recebimentoId/foto:numero",
  auth,
  (req,res)=>{

    const {
      recebimentoId,
      numero
    } = req.params;

    const numeroInt = parseInt(numero);

    if(
      numeroInt < 1 ||
      numeroInt > 24
    ){
      return res.status(400).json({
        erro:"Foto inválida"
      });
    }

    db.get(
      `
      SELECT
        foto${numero} as foto,
        pastaFotos
      FROM desmontagens
      WHERE recebimentoId = ?
      `,
      [recebimentoId],
      (err,row)=>{

        if(err || !row || !row.foto){

          return res
            .status(404)
            .end();

        }

        const arquivo = path.join(
          PASTA_BASE_FOTOS,
          row.pastaFotos,
          row.foto
        );
        
        if(!fs.existsSync(arquivo)){

          return res
            .status(404)
            .json({
              erro:"Arquivo não encontrado"
            });

        }


        res.sendFile(arquivo);

      }
    );

  }
);

router.get(
  "/:recebimentoId/foto-recebimento/:numero",
  auth,
  (req,res)=>{

    const {
      recebimentoId,
      numero
    } = req.params;

    db.get(
      `
      SELECT
        fotoRecebimento${numero} as foto,
        pastaFotos
      FROM desmontagens
      WHERE recebimentoId = ?
      `,
      [recebimentoId],
      (err,row)=>{

        if(err || !row || !row.foto){
          return res.status(404).end();
        }

        const arquivo = path.join(
          PASTA_BASE_FOTOS,
          row.pastaFotos,
          row.foto
        );

        if(!fs.existsSync(arquivo)){
          return res.status(404).json({
            erro:"Arquivo não encontrado"
          });
        }

        res.sendFile(arquivo);

      }
    );
  }
);


module.exports = router;
