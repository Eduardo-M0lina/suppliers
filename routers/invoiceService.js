const express = require("express");
const bdUtils = require("../config//bdUtils");
const logger = require("../config/loggerUtil");
const handler = require("./invoiceHandler");

const router = express.Router();

router.get("/testBD", async (req, res) => {
    logger.info("**testBD**");
    try {
        let response;
        let country = req.headers.country;
        if (!country) {
            throw new Error("The country variable doesn't exist")
        }
        response = await bdUtils.execute2();
        logger.info("Respuesta:", JSON.stringify(response));
        return res.status(200).send(response);
    } catch (e) {
        logger.error("invoiceService Error:" + e.message);
        return res.status(500).send({ status: false, message: e.message });
    }
});


router.post("/insertInvoice", async (req, res) => {
    logger.info("**insertInvoice**");
    try {
        let response;
        let country = req.headers.country;
        if (!country) {
            throw new Error("The country variable doesn't exist")
        }
        let data = req.body;
        response = await handler.insertInvoice(data, country);
        logger.info("Respuesta:", JSON.stringify(response));
        return res.status(200).send(response);
    } catch (e) {
        logger.error("invoiceService Error:" + e.message);
        return res.status(500).send({ status: false, message: e.message });
    }
});

module.exports = router;
