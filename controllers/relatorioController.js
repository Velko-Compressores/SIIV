const puppeteer = require("puppeteer");

exports.gerarPdf = async (req, res) => {

    let browser;

    try {

        const { id } = req.params;

        const token = req.headers.authorization;

        console.log("TOKEN RECEBIDO:", token);

        const url =
            `http://localhost:3000/producao/inspecoes/relatorioInspecaoPdf.html?id=${id}`;

        console.log("URL FINAL:", url);

        browser = await puppeteer.launch({
            headless: true
        });

        console.log("BROWSER INICIADO");

        const page = await browser.newPage(); 

        // Injeta o token antes da página carregar
        await page.evaluateOnNewDocument((token) => {

            localStorage.setItem(
                "token",
                token || ""
            );

        }, token);

        page.on("console", msg => {
            console.log(
                "BROWSER:",
                msg.text()
            );
        });

        page.on("pageerror", err => {
            console.log(
                "PAGE ERROR:",
                err.message
            );
        });

        console.log("ABRINDO PAGINA...");

        await page.goto(url, {
            waitUntil: "networkidle0",
            timeout: 60000
        });

        console.log("PAGINA CARREGADA");

        await page.waitForFunction(
            () => window.relatorioPronto === true,
            {
                timeout: 60000
            }
        );

        console.log("RELATORIO PRONTO");

        console.log("GERANDO PDF...");

        const pdf = await page.pdf({
            format: "A4",
            printBackground: true,

            displayHeaderFooter: true,

            headerTemplate: `<div></div>`,
            
footerTemplate: `
<div style="
    width:100%;
    padding:0 10mm;
    box-sizing:border-box;
    font-size:13px;
    font-family:'Segoe UI', Arial, sans-serif;
    font-weight:400;
    color:#000;
">
    <div style="
        border-top:1px solid #000;
        padding-top:4px;
        display:flex;
        justify-content:space-between;
        align-items:center;
        width:100%;
    ">
        <div style="
            display:flex;
            flex-direction:column;
            gap:2px;
            color:#000;
        ">
            <div>
                VELKO COMPRESSORES LTDA. |
                CNPJ - 12.382.134/0001-01 |
                TEL. (21) 2594-6544 |
                WWW.VELKO.COM.BR
            </div>

            <div>
                SGT SILVA NUNES, 254 - GALPÃO - RAMOS - RJ |
                <span style="
                    color:#008000;
                    font-weight:bold;
                ">
                    EMPRESA AUTORIZADA BITZER
                </span>
            </div>
        </div>

        <div style="
            width:40px;
            height:40px;
            background-color:#f58220;
            color:#ffffff;

            -webkit-print-color-adjust:exact;
            print-color-adjust:exact;

            text-align:center;
            line-height:40px;
            font-size:16px;
            font-weight:700;
        ">
            <span class="pageNumber"></span>
        </div>
    </div>
</div>
`,     

            margin: {
                top: "2mm",
                right: "2mm",
                left: "2mm",
                bottom: "25mm",
            }



        });

        console.log("PDF GERADO");

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            `inline; filename=inspecao-${id}.pdf`
        );

        res.send(pdf);

    } catch (erro) {

        console.error("ERRO COMPLETO:");
        console.error(erro);

        res
            .status(500)
            .send("Erro ao gerar PDF.");

    } finally {

        if (browser) {
            await browser.close();
        }

    }
};