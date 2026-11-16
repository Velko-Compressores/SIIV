// routes/inspecoesRoutes.js

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
  "inspecoes",
  "fotos"
);

fs.mkdirSync(
  PASTA_BASE_FOTOS,
  { recursive:true }
);

const storage = multer.diskStorage({

  destination(req,file,cb){

    cb(null,PASTA_BASE_FOTOS);

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





router.get(
  "/",
  auth,
  (req,res) => {

    db.all(
      `
      SELECT *
      FROM inspecoes
      ORDER BY id DESC
      `,
      [],
      (err,rows) => {

        if(err){

          console.error(err);

          return res.status(500).json({
            erro:"Erro ao listar inspeções"
          });

        }

        res.json(rows);

      }
    );

  }
);

router.post(
  "/programacao",
  auth,
  (req,res) => {

    const item = req.body;

    db.run(
      `
      INSERT INTO inspecoes (

        recebimentoId,

        numeroOS,
        nomeFantasia,
        fabricante,
        modelo,

        tensao,
        numeroSerie, 
        tipo,

        inspecionador,
        prioridade,

        liberadoPor,
        dataLiberacao,

        status,
        situacao

      )

      VALUES (${Array(14).fill("?").join(",")})

      `,
      [

        item.recebimentoId,

        item.numeroOS,
        item.nomeFantasia,
        item.fabricante,
        item.modelo,

        item.tensao,
        item.numeroSerie,  
        item.tipo,      

        item.inspecionador,
        item.prioridade,

        item.liberadoPor,
        item.dataLiberacao,

        "AGUARDANDO",
        "ATIVO"

      ],

      function(err){

        if(err){

          console.error(err);

          return res.status(500).json({
            erro:"Erro ao salvar programação"
          });

        }

        res.json({
          sucesso:true
        });

      }

    );

  }
);

router.put(
  "/programacao/:id",
  auth,
  (req,res) => {

    const { id } = req.params;

    const {
      inspecionador,
      prioridade
    } = req.body;

    db.run(
      `
      UPDATE inspecoes
      SET
        inspecionador = ?,
        prioridade = ?
      WHERE id = ?
      `,
      [
        inspecionador,
        prioridade,
        id
      ],
      function(err){

        if(err){

          console.error(err);

          return res.status(500).json({
            erro:"Erro ao salvar programação"
          });

        }

        res.json({
          sucesso:true
        });

      }
    );

  }
);

router.put(
  "/iniciar/:recebimentoId",
  auth,
  (req,res) => {

    const { recebimentoId } =
      req.params;

    const dataHoraInicio =
      new Date().toISOString();

    db.run(
      `
      UPDATE inspecoes
      SET
        status = 'EM INSPEÇÃO',
        situacao = 'ATIVO',
        dataHoraInicio = ?
      WHERE recebimentoId = ?
      `,
      [
        dataHoraInicio,
        recebimentoId
      ],
      function(err){

        if(err){

          console.error(err);

          return res.status(500).json({
            erro:"Erro ao iniciar inspeção"
          });

        }

        res.json({
          sucesso:true
        });

      }
    );

  }
);


router.put(
  "/pausar/:recebimentoId",
  auth,
  (req,res) => {

    const { recebimentoId } =
      req.params;

    const dataHoraPausa =
      new Date().toISOString();

    db.run(
      `
      UPDATE inspecoes
      SET
        cronometroPausado = 1,
        dataHoraPausa = ?
      WHERE recebimentoId = ?
      `,
      [
        dataHoraPausa,
        recebimentoId
      ],
      function(err){

        if(err){

          console.error(err);

          return res.status(500).json({
            erro:"Erro ao pausar inspeção"
          });

        }

        res.json({
          sucesso:true
        });

      }
    );

  }
);

router.put(
  "/retomar/:recebimentoId",
  auth,
  (req,res) => {

    const { recebimentoId } =
      req.params;

    db.get(
      `
      SELECT
        tempoPausadoTotal,
        dataHoraPausa
      FROM inspecoes
      WHERE recebimentoId = ?
      `,
      [recebimentoId],
      (err,row) => {

        if(err){

          console.error(err);

          return res.status(500).json({
            erro:"Erro ao retomar inspeção"
          });

        }

        const agora =
          new Date();

        const pausa =
          new Date(
            row.dataHoraPausa
          );

        const segundosPausados =
          Math.floor(
            (agora - pausa) / 1000
          );

        const novoTempoPausado =
          (row.tempoPausadoTotal || 0) +
          segundosPausados;

        db.run(
          `
          UPDATE inspecoes
          SET
            cronometroPausado = 0,
            dataHoraPausa = NULL,
            tempoPausadoTotal = ?
          WHERE recebimentoId = ?
          `,
          [
            novoTempoPausado,
            recebimentoId
          ],
          function(err){

            if(err){

              console.error(err);

              return res.status(500).json({
                erro:"Erro ao retomar inspeção"
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


router.put(
  "/finalizar/:recebimentoId",
  auth,
  (req,res) => {

    const { recebimentoId } =
      req.params;

    db.get(
      `
      SELECT
        dataHoraInicio,
        cronometroPausado,
        dataHoraPausa,
        tempoPausadoTotal
      FROM inspecoes
      WHERE recebimentoId = ?
      `,
      [recebimentoId],
      (err,row) => {

        if(err){
          console.error(err);

          return res.status(500).json({
            erro:"Erro ao finalizar inspeção"
          });
        }

        if(!row){
          return res.status(404).json({
            erro:"Inspeção não encontrada"
          });
        }

        if(!row.dataHoraInicio){
          return res.status(400).json({
            erro:"Inspeção sem data de início."
          });
        }

        const dataHoraFim =
          new Date().toISOString();

        let tempoPausadoTotal =
          row.tempoPausadoTotal || 0;

        // Se estiver pausado no momento da finalização
        if(
          row.cronometroPausado &&
          row.dataHoraPausa
        ){

          const inicioPausa =
            new Date(row.dataHoraPausa);

          const agora =
            new Date();

          const segundosPausados =
            Math.floor(
              (agora - inicioPausa) / 1000
            );

          tempoPausadoTotal +=
            segundosPausados;
        }

          const inicio =
            new Date(row.dataHoraInicio);

          const fim =
            new Date(dataHoraFim);

          const segundosTotais =
            Math.floor(
              (fim - inicio) / 1000
            );

          const horas =
            Math.floor(
              segundosTotais / 3600
            );

          const minutos =
            Math.floor(
              (segundosTotais % 3600) / 60
            );

          const segundos =
            segundosTotais % 60;

          const tempoTotal =
            `${horas}h ${minutos}m ${segundos}s`;


          const segundosCronometro =
            Math.max(
              0,
              segundosTotais -
              tempoPausadoTotal
            );

          const horasCronometro =
            Math.floor(
              segundosCronometro / 3600
            );

          const minutosCronometro =
            Math.floor(
              (segundosCronometro % 3600) / 60
            );

          const segundosRestantesCronometro =
            segundosCronometro % 60;

          const tempoCronometro =
            `${horasCronometro}h ${minutosCronometro}m ${segundosRestantesCronometro}s`;



          db.run(
                    `
                    UPDATE inspecoes
                    SET
                      status = 'FINALIZADA',
                      situacao = 'ATIVO',
                      dataHoraFim = ?,
                      tempoTotal = ?,
                      tempoCronometro = ?,
                      cronometroPausado = 0,
                      dataHoraPausa = NULL,
                      tempoPausadoTotal = ?
                    WHERE recebimentoId = ?
                    `,
                    [
                      dataHoraFim,
                      tempoTotal,
                      tempoCronometro,
                      tempoPausadoTotal,
                      recebimentoId
                    ],
                    function(err){

                      if(err){
                        console.error(err);
                        return res.status(500).json({
                          erro:"Erro ao finalizar inspeção"
                        });
                      }

                      // ==========================================
                      // GERAÇÃO AUTOMÁTICA DO REGISTRO COMERCIAL
                      // ==========================================
                      const valores = [
                        recebimentoId,
                        row.numeroOS || "",
                        row.nomeFantasia || "",
                        row.fabricante || "",
                        row.modelo || "",
                        row.tipo || "",
                        row.tensao || "",
                        row.numeroSerie || "",
                        "AGUARDANDO",
                        "ATIVO"
                      ];

                      db.run(
                        `
                        INSERT INTO comercial (
                          recebimentoId,
                          numeroOS,
                          nomeFantasia,
                          fabricante,
                          modelo,
                          tipo,
                          tensao,
                          numeroSerie,
                          status,
                          situacao
                        )
                        VALUES (${Array(valores.length).fill("?").join(",")})
                        `,
                        valores,
                        function(err) {
                          if (err) {
                            console.error("Erro ao gerar comercial:", err);
                            return res.status(500).json({ erro: "Erro ao gerar comercial" });
                          }

                          // Resposta única enviada com sucesso
                          return res.json({ sucesso: true });
                        }
                      );

                    } // Fim do callback do UPDATE das inspeções
                  ); // Fim do db.run do UPDATE
                } // Fim do if(!row) do db.get inicial
              ); // Fim do db.get inicial das inspeções
            } // Fim da rota router.put
          );



router.put(
  "/arquivar/:recebimentoId",
  auth,
  (req,res) => {

    const { recebimentoId } = req.params;

    db.run(
      `
      UPDATE inspecoes
      SET situacao = 'ARQUIVADO'
      WHERE recebimentoId = ?
      `,
      [recebimentoId],
      function(err){

        if(err){

          console.error(err);

          return res.status(500).json({
            erro:"Erro ao arquivar inspeção"
          });

        }

        res.json({
          sucesso:true
        });

      }
    );

  }
);

router.get(
  "/:recebimentoId",
  auth,
  (req, res) => {

    const { recebimentoId } = req.params;

    db.get(
      `
      SELECT *
      FROM inspecoes
      WHERE recebimentoId = ?
      `,
      [recebimentoId],
      (err, row) => {

        if(err){
          console.error(err);

          return res.status(500).json({
            erro:"Erro ao buscar inspeção"
          });
        }

        if(!row){
          return res.status(404).json({
            erro:"Inspeção não encontrada"
          });
        }

        res.json(row);

      }
    );

  }
);


router.put(
  "/observacoes/:recebimentoId",
  auth,
  (req,res) => {

    const { recebimentoId } = req.params;

    db.get(
      `
      SELECT status
      FROM inspecoes
      WHERE recebimentoId = ?
      `,
      [recebimentoId],
      (err,inspecao) => {

        if(err){
          console.error(err);

          return res.status(500).json({
            erro:"Erro ao localizar inspeção"
          });
        }

        if(!inspecao){
          return res.status(404).json({
            erro:"Inspeção não encontrada"
          });
        }

        if(inspecao.status !== "EM INSPEÇÃO"){
          return res.status(403).json({
            erro:"Somente inspeções em andamento podem ser alteradas"
          });
        }

        const campos = [];

        const valores = [];

        for(let i = 1; i <= 12; i++){

          campos.push(
            `comentarioRecebimento${i} = ?`
          );

          valores.push(
            req.body[
              `comentarioRecebimento${i}`
            ] || ""
          );

        }

        for(let i = 1; i <= 24; i++){

          campos.push(
            `comentarioDesmontagem${i} = ?`
          );

          valores.push(
            req.body[
              `comentarioDesmontagem${i}`
            ] || ""
          );
        }

        campos.push(
          "fotosRecebimentoSelecionadas = ?"
        );

        valores.push(
          req.body.fotosRecebimentoSelecionadas || ""
        );

        campos.push(
          "fotosDesmontagemSelecionadas = ?"
        );

        valores.push(
          req.body.fotosDesmontagemSelecionadas || ""
        );

        campos.push(
          "problemasEncontrados = ?"
        );

        valores.push(
          req.body.problemasEncontrados || ""
        );


        campos.push(
          "causasMecanicas = ?"
        );

        valores.push(
          req.body.causasMecanicas || ""
        );

        campos.push(
          "causasEletricas = ?"
        );

        valores.push(
          req.body.causasEletricas || ""
        );

        campos.push(
          "recomendacoesInstalacao = ?"
        );

        valores.push(
          req.body.recomendacoesInstalacao || ""
        );

        campos.push(
          "observacoesGerais = ?"
        );

        valores.push(
          req.body.observacoesGerais || ""
        );



        valores.push(recebimentoId);        

        db.run(
          `
          UPDATE inspecoes
          SET ${campos.join(",")}
          WHERE recebimentoId = ?
          `,
          valores,
          function(err){

            if(err){

              console.error(err);

              return res.status(500).json({
                erro:"Erro ao salvar observações"
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

  (req,res)=>{

    db.get(
      `
      SELECT *
      FROM inspecoes
      WHERE recebimentoId = ?
      `,
      [req.params.recebimentoId],

      (err,inspecao)=>{

        if(err){

          console.error(err);

          return res.status(500).json({
            erro:"Erro ao localizar inspeção"
          });

        }

        if(!inspecao){

          return res.status(404).json({
            erro:"Inspeção não encontrada"
          });

        }

        const pastaDestino = path.join(
          PASTA_BASE_FOTOS,
          inspecao.pastaFotos
        );

        fs.mkdirSync(
          pastaDestino,
          { recursive:true }
        );

        const campos = [];
        const valores = [];


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
            `foto_inspecao-${String(i).padStart(4,"0")}${extensao}`;

          const destinoFinal =
            path.join(
              pastaDestino,
              novoNome
            );

          if(fs.existsSync(destinoFinal)){

            fs.unlinkSync(destinoFinal);

          }

          fs.renameSync(

            path.join(
              PASTA_BASE_FOTOS,
              arquivo.filename
            ),

            destinoFinal

          );

          campos.push(
            `foto${i}=?`
          );

          valores.push(
            novoNome
          );

        }


        if(campos.length === 0){

          return res.json({
            sucesso:true
          });

        }

        valores.push(
          req.params.recebimentoId
        );

        db.run(
          `
          UPDATE inspecoes
          SET ${campos.join(",")}
          WHERE recebimentoId = ?
          `,
          valores,

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

    const numeroInt =
      parseInt(numero);

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
      FROM inspecoes
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

          return res.status(404).json({
            erro:"Arquivo não encontrado"
          });

        }

        res.sendFile(arquivo);

      }

    );

  }
);  


router.delete(
  "/:recebimentoId/foto/:numero",
  auth,
  (req,res)=>{

    const {
      recebimentoId,
      numero
    } = req.params;

    db.get(
      `
      SELECT
        pastaFotos,
        foto${numero} as foto
      FROM inspecoes
      WHERE recebimentoId = ?
      `,
      [recebimentoId],
      (err,row)=>{

        if(err){
          console.error(err);

          return res.status(500).json({
            erro:"Erro ao localizar inspeção"
          });
        }

        if(!row){
          return res.status(404).json({
            erro:"Inspeção não encontrada"
          });
        }

        if(row.foto){

          const caminhoArquivo =
            path.join(
              PASTA_BASE_FOTOS,
              row.pastaFotos,
              row.foto
            );

          if(fs.existsSync(caminhoArquivo)){
            fs.unlinkSync(caminhoArquivo);
          }
        }

        db.run(
          `
          UPDATE inspecoes
          SET foto${numero} = NULL
          WHERE recebimentoId = ?
          `,
          [recebimentoId],

          function(err){

            if(err){
              console.error(err);

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




module.exports = router;
