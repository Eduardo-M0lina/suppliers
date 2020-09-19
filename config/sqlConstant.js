const SQL = {
    INSERT_INVOICE_HEAD: "INSERT INTO INVOICEVE.INVOICE_HEAD " +
        "(COUNTRY,ORDER_NO,INVOICE_NO,SUPPLIER,SUPPLIER_NAME,VENDOR_TYPE,STORE,LOCATION_TYPE,ORDER_DATE,RECEIVE_DATE,STATUS,TERMS,TOTAL_COST_ORDERED,TOTAL_COST_RECEIVED,TOTAL_COST_DISCOUNT,CURRENCY_CODE,APPT_NO,CLAIM_DETAIL,EXCHANGE_RATE,APPOINTMENT_DATE,DOC_TYPE,REF_VENDOR,PROCESSING_STATUS,DOC_ID,SRC_SYSTEM,PROCESSING_ERROR_DESC,QTY_DECISION,COST_DECISION,SERIE,BILL_NUMBER,CONTROL,TOTAL_QTY,DOC_DATE,DUE_DATE,TOTAL_TAX_AMOUNT,TERMS_DSCNT_PCT,TOTAL_COST_INC_TAX,DOC_TAX_DESC,CREATE_USER,CREATE_DATE,NOTE_CREDIT_NO,CONSIGNMENT,INVOICE_TYPE) VALUES " +
        "(:country, :order_no, :invoice_no, :supplier, :supplier_name, :vendor_type, :store, :location_type, :order_date, :receive_date, :status, :terms, :total_cost_ordered, :total_cost_received, :total_cost_discount, :currency_code, :appt_no, :claim_detail, :exchange_rate, :appointment_date, :doc_type, :ref_vendor, :processing_status, :doc_id, :src_system, :processing_error_desc, :qty_decision, :cost_decision, :serie, :bill_number, :control, :total_qty, :doc_date, :due_date, :total_tax_amount, :terms_dscnt_pct, :total_cost_inc_tax, :doc_tax_desc, :create_user, :create_date, :note_credit_no, :consignment, :invoice_type)",
    INSERT_INVOICE_DETAIL: "INSERT INTO INVOICEVE.INVOICE_DETAIL " +
        "(COUNTRY,ORDER_NO,INVOICE_NO,ITEM,ITEM_DESCRIPTION,VAT_CODE,VAT_CODE_DESC,VAT_CODE_RATE,QTY_ORDERED,QTY_PACKAGE_ORDERED,QTY_RECEIVED,QTY_PACKAGE_RECEIVED,TOTAL_COST_PACKAGE,UNIT_COST,UNIT_COST_DISC_PERC,UNIT_COST_DISC_AMOUNT) VALUES " +
        "(:country, :order_no, :invoice_no, :item, :item_description, :vat_code, :vat_code_desc, :vat_code_rate, :qty_ordered, :qty_package_ordered, :qty_received, :qty_package_received, :total_cost_package, :unit_cost, :unit_cost_disc_perc, :unit_cost_disc_amount)",
    SEARCH_SUPPLIER_FATHER: "SELECT SUPPLIER_PARENT FROM SUPS WHERE SUPPLIER = :supplier FETCH FIRST 1 ROWS ONLY"

}


module.exports = {
    SQL,
};