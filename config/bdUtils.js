const oracledb = require("oracledb");
const logger = require("./loggerUtil");
const enviroment = require("./enviroments");
const dbConfigCo = enviroment.bdConfigCo;
const dbConfigVe = enviroment.bdConfigVe;
oracledb.initOracleClient({ libDir: "C:\\libOraclebd" });
//oracledb.initOracleClient({ libDir: "./instantclient" });

const execute2 = async function () {
  logger.info("**###execute2###**");
  let conn;

  try {
    logger.info("**getConnection**");
    conn = await oracledb.getConnection(dbConfigVe);
    logger.info("**conecto**");
    const result = await conn.execute("SELECT * FROM INVOICE_HEAD");
    logger.info("**ejecutada**");
    logger.info("Result" + JSON.stringify(result.rows[0]));
    return JSON.stringify(result.rows[0]);
  } catch (err) {
    console.log("Ouch!", err);
  } finally {
    if (conn) {
      // conn assignment worked, need to close
      await conn.close();
    }
  }
};

const execute = async function () {
  logger.info("**execute**");
  let connection;

  try {
    let sql, binds, options, result;
    connection = await oracledb.getConnection(dbConfigVe);
    logger.info("**connection**");

    sql = `SELECT * FROM INVOICE_HEAD WHERE ORDER_NO = :id AND INVOICE_NO = :supp`;

    binds = { id: 17625213, supp: "002759-2695" };

    // For a complete list of options see the documentation.
    options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // query result format
      // extendedMetaData: true,               // get extra metadata
      // prefetchRows:     100,                // internal buffer allocation size for tuning
      // fetchArraySize:   100                 // internal buffer allocation size for tuning
    };
    logger.info("**execute**");
    result = await connection.execute(sql, binds, options);
    logger.info("**result**");
    //console.log("Metadata: ");
    //console.dir(result.metaData, { depth: null });
    console.log("Query results: ");
    console.log(JSON.stringify(result.rows));
    //console.dir(result.rows, { depth: null });
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
};

const insert = async function () {
  logger.info("**insert**");
  let connection;

  try {
    let sql, binds, options, result;
    connection = await oracledb.getConnection(dbConfigVe);
    logger.info("**connection**");

    sql = `INSERT INTO "INVOICEVE"."INVOICE_HEAD" 
           (COUNTRY, ORDER_NO, INVOICE_NO, SUPPLIER, SUPPLIER_NAME, VENDOR_TYPE, STORE, LOCATION_TYPE, ORDER_DATE, RECEIVE_DATE) 
    VALUES ('VE', 5678, '87654', 213, 'PRUEBA', 'SUPP', 2900, 'W', TO_DATE('2020-09-13 15:28:39', 'YYYY-MM-DD HH24:MI:SS'), NULL)`;

    //binds = { id: 17625213, supp: "002759-2695" };

    // For a complete list of options see the documentation.
    options = {
      autoCommit: true,
      bindDefs: [
        { type: oracledb.NUMBER },
        { type: oracledb.STRING, maxSize: 300 }
      ]
      //outFormat: oracledb.OUT_FORMAT_OBJECT, // query result format
      // extendedMetaData: true,               // get extra metadata
      // prefetchRows:     100,                // internal buffer allocation size for tuning
      // fetchArraySize:   100                 // internal buffer allocation size for tuning
    };
    logger.info("**execute**");
    result = await connection.executeMany(sql, options);
    logger.info("**result**");
    //console.log("Metadata: ");
    //console.dir(result.metaData, { depth: null });
    console.log("Query results: ");
    console.log(JSON.stringify(result));
    //console.dir(result.rows, { depth: null });
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
};

module.exports = {
  execute,
  execute2,
  insert,
};
