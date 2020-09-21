const oracledb = require("oracledb");
const logger = require("./loggerUtil");
const enviroment = require("./enviroments");
const dbConfigCo = enviroment.bdConfigCo;
const dbConfigVe = enviroment.bdConfigVe;
const sqlConstant = require("../config/sqlConstant");
const SQL = sqlConstant.SQL;
//oracledb.initOracleClient({ libDir: "C:\\libOraclebd" });
//oracledb.initOracleClient({ libDir: "./instantclient" });

const executeTest2 = async function () {
  logger.info("**###execute2###**");
  let connection;

  try {
    let sql, binds, options, result;
    logger.info("**getConnection**");
    connection = await oracledb.getConnection(dbConfigVe);
    logger.info("**conecto**");
    sql = "SELECT * FROM INVOICE_DETAIL";
    result = await connection.execute(sql);
    logger.info("**ejecutada**");
    //console.log("Metadata: ");
    //console.dir(result.metaData, { depth: null });
    logger.info("Result" + JSON.stringify(result.rows[0]));
    return JSON.stringify(result.rows[0]);
  } catch (err) {
    logger.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        logger.error(err);
      }
    }
  }
};

const executeTest = async function () {
  logger.info("**execute**");
  let connection;

  try {
    let sql, binds, options, result;
    logger.info("**getConnection**");
    connection = await oracledb.getConnection(dbConfigVe);
    logger.info("**conecto**");

    slq = "SELECT * FROM INVOICE_HEAD";
    /*sql = `SELECT * FROM INVOICE_HEAD WHERE ORDER_NO = :id AND INVOICE_NO = :supp`;
    binds = { id: 17625213, supp: "002759-2695" };*/
    options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT // query result format
    };
    logger.info("**execute**");
    result = await connection.execute(sql, binds, options);
    logger.info("**result**");
    logger.info("Query results: ");
    logger.info(JSON.stringify(result.rows[0]));
  } catch (err) {
    logger.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        logger.error(err);
      }
    }
  }
};

const insertPrueba = async function () {
  logger.info("**insert**");
  let connection;

  try {
    let sql, binds, options, result;
    connection = await oracledb.getConnection(dbConfigVe);
    logger.info("**connection**");

    sql = `INSERT INTO "INVOICEVE"."INVOICE_HEAD" 
           (COUNTRY,ORDER_NO,INVOICE_NO,SUPPLIER,SUPPLIER_NAME,VENDOR_TYPE,STORE,LOCATION_TYPE,ORDER_DATE,RECEIVE_DATE,STATUS,TERMS,TOTAL_COST_ORDERED,TOTAL_COST_RECEIVED,TOTAL_COST_DISCOUNT,CURRENCY_CODE,APPT_NO,CLAIM_DETAIL,EXCHANGE_RATE,APPOINTMENT_DATE,DOC_TYPE,REF_VENDOR,PROCESSING_STATUS,DOC_ID,SRC_SYSTEM,PROCESSING_ERROR_DESC,QTY_DECISION,COST_DECISION,SERIE,BILL_NUMBER,CONTROL,TOTAL_QTY,DOC_DATE,DUE_DATE,TOTAL_TAX_AMOUNT,TERMS_DSCNT_PCT,TOTAL_COST_INC_TAX,DOC_TAX_DESC,CREATE_USER,CREATE_DATE,NOTE_CREDIT_NO,CONSIGNMENT,INVOICE_TYPE) 
    VALUES ('VE', 5678991, '87654', 213, 'PRUEBAx', 'SUPP', 2900, 'W', TO_DATE('2020-09-13 15:28:39', 'YYYY-MM-DD HH24:MI:SS'), NULL)`;


    binds = [];

    options = {
      autoCommit: true
    };
    logger.info("**execute**");
    result = await connection.execute(sql, binds, options);
    logger.info("**result**");
    logger.info("Query results: ");
    logger.info(JSON.stringify(result));
  } catch (err) {
    logger.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        logger.error(err);
      }
    }
  }
};

const insert = async function (sql, data) {
  logger.info("**insert**");
  //console.log((data));
  let connection;

  try {
    let options, result;
    connection = await oracledb.getConnection(dbConfigVe);

    logger.info("**connection**");
    options = {
      autoCommit: true
    };
    logger.info("**execute**");
    result = await connection.execute(sql, data, options);
    logger.info("**result**");
    logger.info("Query results: ");
    logger.info(JSON.stringify(result));
    return true;
  } catch (err) {
    logger.error(err);
    return false;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        logger.error(err);
      }
    }
  }
};

const insertInvoice = async function (data, country) {
  logger.info("**insertInvoice**");
  //console.log((data));
  let connection;

  try {
    let options, result, dbConfig;
    logger.info("**connection**");
    dbConfig = country == "CO" ? dbConfigCo : dbConfigVe;
    connection = await oracledb.getConnection(dbConfig);
    logger.info("**execute head**");
    await connection.execute(SQL.INSERT_INVOICE_HEAD.replace(/SCHEMA/g, SQL["SCHEMA"][country]), data.head);
    logger.info("**execute detail**");
    for await (const detalle of data.det) {
      await connection.execute(SQL.INSERT_INVOICE_DETAIL.replace(/SCHEMA/g, SQL["SCHEMA"][country]), detalle);
    }
    logger.info("**commit**");
    await connection.commit();
    logger.info("**result**");
    logger.info(JSON.stringify(result));
    return true;
  } catch (err) {
    logger.error(err);
    throw new Error(err.message)
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        logger.error(err);
      }
    }
  }
};

const searchList = async function (sql, data, country) {
  return search(sql, data, country, true);
}

const searchOne = async function (sql, data, country) {
  return search(sql, data, country, false);
}

const search = async function (sql, data, country, isList) {
  logger.info("**search**");
  logger.info("data:" + JSON.stringify(data));
  //logger.info("country:" + JSON.stringify(country));
  logger.info("sql:" + sql);
  let connection;

  try {
    let options, result, dbConfig;
    logger.info("**connection**");
    dbConfig = country == "CO" ? dbConfigCo : dbConfigVe;
    connection = await oracledb.getConnection(dbConfig);
    options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT // query result format
    };
    logger.info("**execute SQL**");
    result = await connection.execute(sql, data, options);
    logger.info("**result**");
    logger.info(JSON.stringify(result));
    if (isList) {
      return result.rows;
    }
    return result.rows[0];
  } catch (err) {
    logger.error(err);
    throw new Error(err.message)
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        logger.error(err);
      }
    }
  }
};

module.exports = {
  executeTest,
  executeTest2,
  insert,
  insertInvoice,
  insertPrueba,
  searchList,
  searchOne
};
