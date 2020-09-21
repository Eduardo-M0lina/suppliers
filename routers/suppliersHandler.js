const logger = require("../config/loggerUtil");
const bdUtils = require("../config//bdUtils");
const sqlConstant = require("../config/sqlConstant");
const SQL = sqlConstant.SQL;

const getOrderDetail = async function (data, country) {
    logger.info("**getOrderDetail**");
    var res = new Object();
    try {
        let detail_order = await bdUtils.searchOne(SQL.GET_ORDER_DETAIL_BY_ID.replace(/SCHEMA/g, SQL["SCHEMA"][country]), data, country);
        if (!detail_order) {
            throw new Error("Codigo de orden no existe")
        }
        //logger.info("detail_order:"+JSON.stringify(detail_order));
        let invoiceHead = await bdUtils.searchList(SQL.GET_INVOICE_BY_ORDER_NO.replace(/SCHEMA/g, SQL["SCHEMA"][country]), data, country);
        //logger.info("invoiceHead:"+JSON.stringify(invoiceHead));
        for await (const invoice of invoiceHead) {
            let itemData = new Object();
            itemData.orderNo = data.orderNo;
            itemData.invoiceNo = invoice.invoiceNo;
            invoice.invoiceItems = await bdUtils.searchList(SQL.GET_ITEMS_BY_INVOICE.replace(/SCHEMA/g, SQL["SCHEMA"][country]), itemData, country);
            //logger.info("invoiceHead.invoiceItems:"+JSON.stringify(invoiceHead.invoiceItems));
        }
        logger.info("invoiceHead:" + JSON.stringify(invoiceHead));
        detail_order.invoices = invoiceHead;
        //GET_ITEMS_BY_INVOICE
        let itemData = new Object();
        itemData.orderNo = data.orderNo;
        itemData.supplier = detail_order.supplier;
        detail_order.orderItems = await bdUtils.searchList(SQL.GET_ITEMS_BY_ORDER.replace(/SCHEMA/g, SQL["SCHEMA"][country]), itemData, country);
        //response
        res.status = true;
        res.message = "OK";
        res.data = detail_order
        return res;
    } catch (err) {
        logger.error("Error getOrderDetail!");
        logger.error(err);
        throw new Error(err);
    }
}

module.exports = {
    getOrderDetail,
};