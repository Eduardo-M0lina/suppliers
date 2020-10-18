const SQL = {
    SCHEMA: {
        CO: "INVOICE",
        VE: "INVOICEVE"
    },
    INSERT_INVOICE_HEAD:
        "INSERT INTO SCHEMA.INVOICE_HEAD " +
        "(COUNTRY,ORDER_NO,INVOICE_NO,SUPPLIER,SUPPLIER_NAME,VENDOR_TYPE,STORE,LOCATION_TYPE,ORDER_DATE,RECEIVE_DATE,STATUS,TOTAL_COST_ORDERED,TOTAL_COST_RECEIVED,TOTAL_COST_DISCOUNT,CURRENCY_CODE,EXCHANGE_RATE,DOC_TYPE,REF_VENDOR,PROCESSING_STATUS,DOC_ID,SRC_SYSTEM,TOTAL_QTY,DOC_DATE,DUE_DATE,TOTAL_TAX_AMOUNT,TOTAL_COST_INC_TAX,CREATE_USER,CREATE_DATE,NOTE_CREDIT_NO,CONSIGNMENT,INVOICE_TYPE) VALUES " +
        "(:country, :order_no, :invoice_no, :supplier, :supplier_name, :vendor_type, :store, :location_type, :order_date, :receive_date, :status, :total_cost_ordered, :total_cost_received, :total_cost_discount, :currency_code, :exchange_rate, :doc_type, :ref_vendor, :processing_status, :doc_id, :src_system, :total_qty, :doc_date, :due_date, :total_tax_amount, :total_cost_inc_tax, :create_user, :create_date, :note_credit_no, :consignment, :invoice_type)",
    INSERT_INVOICE_DETAIL:
        "INSERT INTO SCHEMA.INVOICE_DETAIL " +
        "(COUNTRY,ORDER_NO,INVOICE_NO,ITEM,ITEM_DESCRIPTION,VAT_CODE,VAT_CODE_DESC,VAT_CODE_RATE,QTY_ORDERED,QTY_PACKAGE_ORDERED,QTY_RECEIVED,QTY_PACKAGE_RECEIVED,TOTAL_COST_PACKAGE,UNIT_COST,UNIT_COST_DISC_PERC,UNIT_COST_DISC_AMOUNT) VALUES " +
        "(:country, :order_no, :invoice_no, :item, :item_description, :vat_code, :vat_code_desc, :vat_code_rate, :qty_ordered, :qty_package_ordered, :qty_received, :qty_package_received, :total_cost_package, :unit_cost, :unit_cost_disc_perc, :unit_cost_disc_amount)",
    SEARCH_SUPPLIER_FATHER:
        "SELECT SUPPLIER_PARENT FROM SCHEMA.SUPS WHERE SUPPLIER = :supplier FETCH FIRST 1 ROWS ONLY",
    GET_ORDER_DETAIL_BY_ID:
        `SELECT NVL(ST.STORE_NAME, 'CENDIS') "storeName", NVL(ST.STORE, OL.LOCATION) "store", OH.CREATE_DATETIME "createDate", OH.NOT_BEFORE_DATE "notBeforeDate", OH.NOT_AFTER_DATE "notAfterDate", OH.STATUS "status", ` +
        `OH.CURRENCY_CODE "currencyCode", OL.TOTAL_COST_ORDERED "totalCostOrdered", OL.COUNT_ITEMS "qtyItems", OL.QTY_ORDERED "qtyOrdered", SUPPLIER "supplier" ` +
        `FROM SCHEMA.ORDHEAD OH ` +
        `LEFT JOIN (SELECT OL2.ORDER_NO, OL2.LOCATION, SUM(OL2.UNIT_COST) TOTAL_COST_ORDERED, COUNT(OL2.ITEM) COUNT_ITEMS, SUM(OL2.LAST_ROUNDED_QTY) QTY_ORDERED ` +
        `           FROM SCHEMA.ORDLOC OL2 ` +
        `GROUP BY OL2.ORDER_NO, OL2.LOCATION) OL ON OH.ORDER_NO = OL.ORDER_NO ` +
        `LEFT JOIN SCHEMA.STORE ST ON OL.LOCATION = ST.STORE ` +
        `WHERE OH.ORDER_NO = :orderNo`,
    GET_INVOICE_BY_ORDER_NO:
        `SELECT IH.INVOICE_NO "invoiceNo", IH.CURRENCY_CODE "currencyCode", NVL(IH.TOTAL_QTY, 0) "totalQty", IH.TOTAL_COST_RECEIVED "totalCostReceived", IH.TOTAL_TAX_AMOUNT "totalTaxAmount", IH.DOC_DATE "docDate", ` +
        `SUBSTR(IH.STATUS, 4) "status", IH.INVOICE_TYPE "invoiceType", NVL2(IH.DOC_ID, 'FILE', 'PORTAL') "docId" ` +
        `FROM SCHEMA.INVOICE_HEAD IH WHERE IH.ORDER_NO = :orderNo`,
    GET_ITEMS_BY_INVOICE:
        `SELECT ITEM "item", VAT_CODE_RATE "vatRate", QTY_RECEIVED "qtyRecieve", UNIT_COST "unitCost", ITEM_DESCRIPTION "description" ` +
        `FROM SCHEMA.INVOICE_DETAIL ` +
        `WHERE ORDER_NO = :orderNo AND INVOICE_NO = :invoiceNo `,
    GET_ITEMS_BY_ORDER:
        `SELECT OL.ITEM "item", OL.UNIT_COST "unitCost", OL.QTY_ORDERED "qtyOrdered", OL.LAST_ROUNDED_QTY "qtyRecieve", IM.SHORT_DESC "description", VI.VAT_RATE "vatRate" ` +
        `FROM SCHEMA.ORDLOC OL ` +
        `INNER JOIN (SELECT * FROM SCHEMA.ITEM_SUPPLIER WHERE SUPPLIER IN (SELECT SUPS.SUPPLIER FROM SCHEMA.SUPS WHERE (SUPS.SUPPLIER = :supplier OR SUPS.SUPPLIER_PARENT = :supplier))) ISU ON OL.ITEM = ISU.ITEM ` +
        `LEFT JOIN SCHEMA.ITEM_MASTER IM ON ISU.ITEM = IM.ITEM ` +
        `LEFT JOIN (SELECT VI1.ITEM, VI1.VAT_REGION, VI1.VAT_TYPE, VI1.VAT_CODE, VI1.VAT_RATE FROM SCHEMA.VAT_ITEM VI1 ` +
        `INNER JOIN (SELECT DISTINCT (ITEM) ITEM, MAX(CREATE_DATETIME) CREATE_DATETIME FROM SCHEMA.VAT_ITEM GROUP BY ITEM) VI2 ` +
        `ON VI1.ITEM = VI2.ITEM AND VI1.CREATE_DATETIME = VI2.CREATE_DATETIME where vi1.active_date = (SELECT MAX(a.active_date) FROM vat_item a WHERE a.item = vi1.item)) VI ON IM.ITEM = VI.ITEM ` +
        `WHERE OL.ORDER_NO = :orderNo`,
    GET_SUPPLIER_BY_PARENT:
        `SELECT SUPPLIER_PARENT "supplierParent", SUBSTR(comment_desc, 10) "comment",  sup_name "name", SUPPLIER "supplier" ` +
        `FROM SCHEMA.SUPS  WHERE SUPPLIER = :supplier`,
    GET_ORDERS_BY_SUPPLIER:
        `SELECT * FROM (SELECT oh.ORDER_NO "order", oh.status "status", COUNT(sh.ORDER_NO) "shipped", COUNT(ol.item) as CANTIDAD, oh.Create_Datetime "createDate", sh.RECEIVE_DATE "receiveDate", ` +
        `oh.supplier "supplier", NVL(st.STORE, ol.LOCATION) "store", NVL(st.store_name, 'CENDIS') "store_name", CASE WHEN (COUNT(sh.ORDER_NO) = 0 AND oh.STATUS = 'C') THEN 'N' ELSE 'Y' END ACTIVE ` +
        `FROM SCHEMA.ordhead oh ` +
        `LEFT JOIN SCHEMA.ordloc ol ON ol.order_no = oh.order_no ` +
        `LEFT JOIN SCHEMA.sups s  ON s.supplier = oh.supplier ` +
        `LEFT JOIN SCHEMA.shipment sh  ON sh.order_no = oh.order_No ` +
        `LEFT JOIN SCHEMA.store st  ON ol.location = st.store ` +
        `WHERE s.supplier_parent = :supplierFather  CONDITIONAL s.supplier = :supplier ` +
        `GROUP BY oh.ORDER_NO, oh.status, oh.supplier, oh.Create_Datetime, sh.RECEIVE_DATE, NVL(st.STORE, ol.LOCATION),  NVL(st.store_name, 'CENDIS')) ` +
        `WHERE CANTIDAD > 0 `+
        `AND oh.status = 'C' AND EXISTS (SELECT s.order_no FROM SCHEMA.shipment s WHERE s.order_no = :orderNo)`,

}


module.exports = {
    SQL,
};
