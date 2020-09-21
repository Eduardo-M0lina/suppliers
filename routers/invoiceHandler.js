const logger = require("../config/loggerUtil");
const bdUtils = require("../config//bdUtils");
const sqlConstant = require("../config/sqlConstant");
var moment = require('moment');
const SQL = sqlConstant.SQL;

const insertInvoice = async function (data, country) {
    logger.info("**insertInvoice**");
    var res = new Object();
    try {
        data.head.order_date = new Date(data.head.order_date);
        if (await bdUtils.insertInvoice(data, country)) {
            res.status = true;
            res.message = "Factura guardada!";
        } else {
            res.status = false;
            res.message = "Error al insertar factura";
        }
        return res;
    } catch (err) {
        logger.error("Error insertInvoice!");
        logger.error(err);
        throw new Error(err);
    }

}

module.exports = {
    insertInvoice,
};