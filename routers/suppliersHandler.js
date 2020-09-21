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

const ordersBySupplier = async function (data, country) {
    logger.info("**ordersBySupplier**");
    var res = new Object();
    try {
        let req = new Object();
        req.supplier = Number(data.supplier);
        let supplier = await bdUtils.searchOne(SQL.GET_SUPPLIER_BY_PARENT.replace(/SCHEMA/g, SQL["SCHEMA"][country]), req, country);
        if (!supplier) {
            throw new Error("Proveedor no existe")
        }
        //logger.info("detail_order:"+JSON.stringify(detail_order));
        conditional = data.supplier != data.supplierFather ? "AND" : "OR";
        let orders = await bdUtils.searchList(SQL.GET_ORDERS_BY_SUPPLIER.replace(/SCHEMA/g, SQL["SCHEMA"][country]).replace(/CONDITIONAL/g, conditional), data, country);
        supplier.orders = orders;
        //response
        res.status = true;
        res.message = "OK";
        res.data = supplier
        return res;
    } catch (err) {
        logger.error("Error ordersBySupplier!");
        logger.error(err);
        throw new Error(err);
    }
}

module.exports = {
    getOrderDetail,
    ordersBySupplier
};