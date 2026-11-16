// routes/inspecaoPecasRoutes.js

const express = require("express");
const router = express.Router();

const db = require("../config/db");
const auth = require("../middlewares/auth");



    router.get(
    "/:recebimentoId",
    auth,
    (req,res) => {

        const { recebimentoId } =
        req.params;

        db.all(
        `
        SELECT
            id,
            secao,
            descricao,
            quantidade,
            observacao
        FROM inspecaoPecas
        WHERE recebimentoId = ?
        ORDER BY secao, descricao
        `,
        [recebimentoId],
        (err,rows) => {

            if(err){

            console.error(err);

            return res.status(500).json({
                erro:"Erro ao carregar peças"
            });

            }

            res.json(rows);

        }
        );

    }
    );


    router.post(
    "/:recebimentoId",
    auth,
    (req,res) => {

        const { recebimentoId } =
        req.params;

        const pecas =
        req.body;

        db.run(
        `
        DELETE FROM inspecaoPecas
        WHERE recebimentoId = ?
        `,
        [recebimentoId],
        (err) => {

            if(err){

            console.error(err);

            return res.status(500).json({
                erro:"Erro ao limpar peças"
            });

            }

            if(
            !Array.isArray(pecas) ||
            pecas.length === 0
            ){

            return res.json({
                sucesso:true
            });

            }

            const stmt =
            db.prepare(
            `
            INSERT INTO inspecaoPecas (

                recebimentoId,

                secao,
                descricao,
                quantidade,
                observacao

            )

            VALUES (${Array(5).fill("?").join(",")})

            `
            );


            pecas.forEach(peca => {

            stmt.run([
                recebimentoId,
                peca.secao,
                peca.descricao,
                peca.quantidade,
                peca.observacao || null
            ]);

            });

            stmt.finalize((err) => {

            if(err){

                console.error(err);

                return res.status(500).json({
                erro:"Erro ao salvar peças"
                });

            }

            res.json({
                sucesso:true
            });

            });

        }
        );

    }
    );



module.exports = router;
