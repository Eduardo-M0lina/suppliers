const oracledb = require("oracledb");
const logger = require("./loggerUtil");
const enviroment = require("./enviroments");
const dbConfigCo = enviroment.bdConfigCo;
const dbConfigVe = enviroment.bdConfigVe;
const sqlConstant = require("../config/sqlConstant");
const SQL = sqlConstant.SQL;
oracledb.initOracleClient({ libDir: "C:\\libOraclebd" });
//oracledb.initOracleClient({ libDir: "./instantclient" });


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
  //logger.info("data:" + JSON.stringify(data));
  //logger.info("country:" + JSON.stringify(country));
  //logger.info("sql:" + sql);
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
    //logger.info(JSON.stringify(result));
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
  insert,
  insertInvoice,
  searchList,
  searchOne
};
