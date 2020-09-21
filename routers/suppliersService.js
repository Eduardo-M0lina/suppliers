const express = require("express");
const bdUtils = require("../config//bdUtils");
const logger = require("../config/loggerUtil");
const handler = require("./suppliersHandler");

const router = express.Router();

router.get("/orders/:orderNo", async (req, res) => {
    logger.info("**/orders/:orderNo**");
    try {
        let response;
        let country = req.headers.country;
        if (!country) {
            throw new Error("The country variable doesn't exist")
        }
        let data = new Object();
        data.orderNo = Number(req.params.orderNo);
        response = await handler.getOrderDetail(data, country);
        //logger.info("Respuesta:" + JSON.stringify(response));
        return res.status(200).send(response);
    } catch (e) {
        logger.error("suppliersService Error:" + e.message);
        return res.status(500).send({ status: false, message: e.message });
    }
});

router.get("/orders/supplier/:supplier/supplierFather/:supplierFather", async (req, res) => {
    logger.info("**/orders/supplier/:supplier/supplierFather/:supplierFather**");
    try {
        let response;
        let country = req.headers.country;
        if (!country) {
            throw new Error("The country variable doesn't exist")
        }
        let data = new Object();
        data.supplier = Number(req.params.supplier);
        data.supplierFather = Number(req.params.supplierFather);
        response = await handler.ordersBySupplier(data, country);
        //logger.info("Respuesta:" + JSON.stringify(response));
        return res.status(200).send(response);
    } catch (e) {
        logger.error("suppliersService Error:" + e.message);
        return res.status(500).send({ status: false, message: e.message });
    }
});

module.exports = router;
