const filesStructure = require("../config/filesStructure");
const fStructure = filesStructure.FILE_STRUCTURE;
const enviroment = require("../config/enviroments");
const logger = require("../config/loggerUtil");
const readline = require("readline");
const fs = require("fs");

const config = enviroment.configFtp;

const processFile = async function (File) {
  logger.info("**readFile**");
  //logger.info("File:"+JSON.stringify(File));
  var res = new Object();
  var checkFile = [];

  try {
    const buf = Buffer.from(File.data);
    //await writeFileFtp(buf);
    var arrayLines = buf.toString().split(/(?:\r\n|\r|\n)/g);
    //Validar si el archivo esta vacio
    if (arrayLines.length <= 1) {
      res.status = false;
      res.message = "Formato incorrecto, archivo vacio!";
      return res;
    }
    //Leer el array de string lina por linea
    checkFile = await readArray(arrayLines);
    //validar si existen errores de validacion
    if (checkFile.length > 0) {
      res.status = false;
      res.message = "Formato incorrecto!";
      res.data = checkFile;
      return res;
    }
    //construir lineas
    var resBuildFile;
    logger.info("File.filename:" + File.name);
    let typeFile = File.name.substring(File.name.length - 5, File.name.length - 4);
    logger.info("typeFile:" + typeFile);
    if (typeFile == "F") {
      resBuildFile = await buildBillFile(arrayLines);
    } else {
      if (typeFile == "N") {
        resBuildFile = await buildCreditNoteFile(arrayLines);
      } else {
        res.status = false;
        res.message = "Nombre de archivo invalido!";
        return res;
      }
    }
    //let finalArray = await buildBillFile(arrayLines);
    //escribir en directorio FTP
    let resFtp = await writeFileFtp(resBuildFile);
    if (resFtp) {
      res.status = true;
      res.message = "Archivo Generado!";
      return res;
    } else {
      res.status = false;
      res.message = "Error al generar archivo!";
      return res;
    }
  } catch (err) {
    logger.error("Error processFile!");
    logger.error(err);
    throw new Error(err);
  }
};

async function readArray(arrayLines) {
  logger.info("**readArray**");
  var checkFile = [];
  var lineNumber = 0;
  for await (const element of arrayLines) {
    lineNumber = lineNumber + 1;
    //logger.info("lineNumber:" + lineNumber);
    let errors = await valitateStructureTradePlace(element, lineNumber);
    //logger.info("ERRORES LINEA:" + JSON.stringify(errors));
    checkFile.concat(errors);
    checkFile = checkFile.concat(errors);
  }
  return checkFile;
}

async function valitateStructureTradePlace(line, lineNumber) {
  logger.info("**valitateStructureTradePlace**");
  let i = 0;
  let msjError = [];
  let values = line.split(";");
  let type;
  let msj;
  //logger.info("lineNumber:" + lineNumber);
  //logger.info("line:" + line);
  //logger.info("values:" + values.length);
  if (values.length > 0) {
    if (values[0] == "01") {
      type = "head";
      if (values.length < 34) {
        msj = "Error en linea: " + lineNumber + ", faltan campos";
        msjError.push(msj);
      }
    } else {
      if (values[0] == "02") {
        type = "det";
        if (values.length < 26) {
          msj = "Error en linea: " + lineNumber + ", faltan campos";
          msjError.push(msj);
        }
      } else {
        if (values[0].length > 0) {
          msj = "Error en linea: " + lineNumber + ", posición 1";
          msjError.push(msj);
        }
      }
    }
  }
  if (type) {
    for (let index = 0; index < values.length - 1; index++) {
      //logger.info("index:" + index);
      const element = values[index];
      //logger.info("element:" + element);
      //logger.info("values[index].length:" + values[index].length);
      //logger.info("fStructure:" + fStructure["TradePlaceLong"][type][index]["lon"]);
      if (values[index].length > fStructure["TradePlaceLong"][type][index]["lon"]) {
        msj = "Error en linea: " + lineNumber + ", posición: " + (index + 1) + ", campo con tamano superior";
        //logger.error(msj);
        msjError.push(msj);
        i++;
      }
    }
  }
  return msjError;
}

async function buildBillFile(arrayLines) {
  logger.info("**buildLines**");
  let finalArray = [];
  let head = "";
  let head2 = "";
  let det = "";
  let head_totalUnid = "";
  let exentoProduc = "";
  let noOrdenCompra = "";
  let razonSocial = "";
  var m = new Date();
  var dateGen =
    m.getDate() +
    "" +
    (m.getMonth() + 1) +
    "" +
    m.getFullYear() +
    "" +
    m.getHours() +
    "" +
    m.getMinutes() +
    "" +
    m.getSeconds() +
    "F";

  //logger.info("dateGen:" + dateGen);
  for await (const line of arrayLines) {
    //logger.info("line:"+line);
    let values = line.split(";");
    //logger.info("values:"+values.length);
    finalLine = "";
    det = "";
    //logger.info("1head:"+head);
    if (values[0] == "01") {
      head = "";
      head2 = "";
      noOrdenCompra = values[fStructure["TradePlacePos"]["head"]["head_numAsoci"]["pos"] - 1];
      razonSocial = values[fStructure["TradePlacePos"]["head"]["head_nomRaz"]["pos"] - 1];
      //contruir datos cabecera
      head = head.concat(noOrdenCompra).concat("|"); //1
      head = head.concat(values[fStructure["TradePlacePos"]["head"]["head_numSerie"]["pos"] - 1]).concat("|"); //2
      head = head.concat(values[fStructure["TradePlacePos"]["head"]["head_numFactura"]["pos"] - 1]).concat("|"); //3
      head = head.concat(values[fStructure["TradePlacePos"]["head"]["head_numContro"]["pos"] - 1]).concat("|"); //4
      let fecha = values[fStructure["TradePlacePos"]["head"]["head_fechaEmision"]["pos"] - 1]; //5
      let ano = fecha.substring(0, 4);
      let mes = fecha.substring(4, 6);
      let dia = fecha.substring(6, 8);
      head = head.concat(dia + "/" + mes + "/" + ano);
      head = head.concat("|");
      head = head.concat(values[fStructure["TradePlacePos"]["head"]["head_subTotal"]["pos"] - 1]).concat("|"); //6
      head = head.concat(values[fStructure["TradePlacePos"]["head"]["head_montTtalImp"]["pos"] - 1]).concat("|"); //7
      head2 = head2.concat(values[fStructure["TradePlacePos"]["head"]["head_montTtalFac"]["pos"] - 1]).concat("|"); //9
      head_facConsi = values[fStructure["TradePlacePos"]["head"]["head_facConsi"]["pos"] - 1]; //10
      if (head_facConsi == "Y") {
        head_facConsi = "S";
      }
      head2 = head2.concat(head_facConsi).concat("|"); //10
      head2 = head2.concat("F|"); //11
      head_totalUnid = values[fStructure["TradePlacePos"]["head"]["head_totalUnid"]["pos"] - 1]; //18
    }
    if (values[0] == "02") {
      det = "";
      let codItem = values[fStructure["TradePlacePos"]["det"]["det_codBarra"]["pos"] - 1].concat(";");
      codItem = codItem.concat(values[fStructure["TradePlacePos"]["det"]["det_codInterno"]["pos"] - 1]).concat(";");
      codItem = codItem.concat(values[fStructure["TradePlacePos"]["det"]["det_sku"]["pos"] - 1]).concat("|");
      det = det.concat(codItem); //12
      det = det.concat(values[fStructure["TradePlacePos"]["det"]["det_descProd"]["pos"] - 1]).concat("|"); //13
      det = det.concat(values[fStructure["TradePlacePos"]["det"]["det_uniXbul"]["pos"] - 1]).concat("|"); //14
      det = det.concat("1.00|"); //15
      det = det.concat(values[fStructure["TradePlacePos"]["det"]["det_precUnit"]["pos"] - 1]).concat("|"); //16
      det = det.concat(values[fStructure["TradePlacePos"]["det"]["det_ttalLinea"]["pos"] - 1]).concat("|"); //17
      det = det.concat(head_totalUnid).concat("|"); //18
      det = det.concat("VES").concat("|"); //19
      det = det.concat("|"); //20
      exentoProduc = values[fStructure["TradePlacePos"]["det"]["det_tasaIva"]["pos"] - 1]; //8
      if (exentoProduc == "16.00" || exentoProduc == "") {
        exentoProduc = "0.00".concat("|");
      } else {
        exentoProduc = values[fStructure["TradePlacePos"]["det"]["det_tasaIva"]["pos"] - 1].concat("|"); //8
      }
    }
    if (det != "") {
      //logger.info("3head:" + head);
      //logger.info("4det:" + det);
      finalLine = finalLine.concat(head).concat(exentoProduc).concat(head2).concat(det).concat("\n");

      finalArray.push(finalLine);
    }
  }
  //logger.info("finalArray:" + finalArray);
  var resBuildFile = new Object();
  resBuildFile.noOrdenCompra = noOrdenCompra;
  resBuildFile.razonSocial = razonSocial;
  resBuildFile.dateGen = dateGen;
  resBuildFile.finalArray = finalArray;
  logger.info("resBuildFile.finalArray:" + resBuildFile.finalArray);
  return resBuildFile;
}

async function buildCreditNoteFile(arrayLines) {
  logger.info("**buildCreditNoteFile**");
  let finalArray = [];
  let head = "";
  let head2 = "";
  let det = "";
  let head_totalUnid = "";
  let exentoProduc = "";
  let noOrdenCompra = "";
  let razonSocial = "";
  var m = new Date();
  var dateGen =
    m.getDate() +
    "" +
    (m.getMonth() + 1) +
    "" +
    m.getFullYear() +
    "" +
    m.getHours() +
    "" +
    m.getMinutes() +
    "" +
    m.getSeconds() +
    "N";

  //logger.info("dateGen:" + dateGen);
  for await (const line of arrayLines) {
    //logger.info("line:"+line);
    let values = line.split(";");
    //logger.info("values:"+values.length);
    finalLine = "";
    det = "";
    //logger.info("1head:"+head);
    if (values[0] == "01") {
      head = "";
      head2 = "";
      noOrdenCompra = values[fStructure["TradePlacePos"]["head"]["head_numAsoci"]["pos"] - 1];
      razonSocial = values[fStructure["TradePlacePos"]["head"]["head_nomRaz"]["pos"] - 1];
      //contruir datos cabecera
      head = head.concat(noOrdenCompra).concat("|"); //1
      head = head.concat(values[fStructure["TradePlacePos"]["head"]["head_numSerie"]["pos"] - 1]).concat("|"); //2
      head = head.concat(values[fStructure["TradePlacePos"]["head"]["head_numFactura"]["pos"] - 1]).concat("|"); //3
      head = head.concat(values[fStructure["TradePlacePos"]["head"]["head_numContro"]["pos"] - 1]).concat("|"); //4
      let fecha = values[fStructure["TradePlacePos"]["head"]["head_fechaEmision"]["pos"] - 1]; //5
      let ano = fecha.substring(0, 4);
      let mes = fecha.substring(4, 6);
      let dia = fecha.substring(6, 8);
      head = head.concat(dia + "/" + mes + "/" + ano);
      head = head.concat("|");
      head = head.concat(values[fStructure["TradePlacePos"]["head"]["head_subTotal"]["pos"] - 1]).concat("|"); //6
      head = head.concat(values[fStructure["TradePlacePos"]["head"]["head_montTtalImp"]["pos"] - 1]).concat("|"); //7
      head2 = head2.concat(values[fStructure["TradePlacePos"]["head"]["head_montTtalFac"]["pos"] - 1]).concat("|"); //9
      head_facConsi = values[fStructure["TradePlacePos"]["head"]["head_facConsi"]["pos"] - 1]; //10
      if (head_facConsi == "Y") {
        head_facConsi = "S";
      }
      head2 = head2.concat(head_facConsi).concat("|"); //10
      head2 = head2.concat("N|"); //11
      head_totalUnid = values[fStructure["TradePlacePos"]["head"]["head_totalUnid"]["pos"] - 1]; //18
      head_numFacRefe = values[fStructure["TradePlacePos"]["head"]["head_numFacRefe"]["pos"] - 1]; //20
    }
    if (values[0] == "02") {
      det = "";
      let codItem = values[fStructure["TradePlacePos"]["det"]["det_codBarra"]["pos"] - 1].concat(";");
      codItem = codItem.concat(values[fStructure["TradePlacePos"]["det"]["det_codInterno"]["pos"] - 1]).concat(";");
      codItem = codItem.concat(values[fStructure["TradePlacePos"]["det"]["det_sku"]["pos"] - 1]).concat("|");
      det = det.concat(codItem); //12
      det = det.concat(values[fStructure["TradePlacePos"]["det"]["det_descProd"]["pos"] - 1]).concat("|"); //13
      det = det.concat(values[fStructure["TradePlacePos"]["det"]["det_uniXbul"]["pos"] - 1]).concat("|"); //14
      det = det.concat("1.00|"); //15
      det = det.concat(values[fStructure["TradePlacePos"]["det"]["det_precUnit"]["pos"] - 1]).concat("|"); //16
      det = det.concat(values[fStructure["TradePlacePos"]["det"]["det_ttalLinea"]["pos"] - 1]).concat("|"); //17
      det = det.concat(head_totalUnid).concat("|"); //18
      det = det.concat("VES").concat("|"); //19
      det = det.concat(head_numFacRefe).concat("|"); //20
      exentoProduc = values[fStructure["TradePlacePos"]["det"]["det_tasaIva"]["pos"] - 1]; //8
      if (exentoProduc == "16.00" || exentoProduc == "") {
        exentoProduc = "0.00".concat("|");
      } else {
        exentoProduc = values[fStructure["TradePlacePos"]["det"]["det_tasaIva"]["pos"] - 1].concat("|"); //8
      }
    }
    if (det != "") {
      //logger.info("3head:" + head);
      //logger.info("4det:" + det);
      finalLine = finalLine.concat(head).concat(exentoProduc).concat(head2).concat(det).concat("\n");

      finalArray.push(finalLine);
    }
  }
  //logger.info("finalArray:" + finalArray);
  var resBuildFile = new Object();
  resBuildFile.noOrdenCompra = noOrdenCompra;
  resBuildFile.razonSocial = razonSocial;
  resBuildFile.dateGen = dateGen;
  resBuildFile.finalArray = finalArray;
  logger.info("resBuildFile.finalArray:" + resBuildFile.finalArray);
  return resBuildFile;
}

async function writeFileFtp(resBuildFile) {
  logger.info("**writeFileFtp**");
  let Client = require("ssh2-sftp-client");
  let sftp = new Client();
  logger.info("config:" + JSON.stringify(config));

  let buff = Buffer.from(resBuildFile.finalArray.join(""), "utf8");

  let remote = "/data/" + resBuildFile.noOrdenCompra + resBuildFile.razonSocial + resBuildFile.dateGen + ".txt";
  return (
    sftp
      .connect(config)
      .then(async () => {
        sftp.put(buff, remote);
        logger.info("Archivo generado");
        return true;
        //return sftp.list('/data');
      })
      /*.then(async (data) => {
      console.log(data, "the data info");
    })*/
      .catch((err) => {
        logger.error("Error generar archivo en ftp:" + err);
        return false;
      })
  );
}

module.exports = {
  processFile,
};
