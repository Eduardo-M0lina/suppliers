const express = require("express");
const bdUtils = require("../config//bdUtils");
const logger = require("../config/loggerUtil");

const router = express.Router();

router.get("/testBD", async (req, res) => {
  logger.info("**testBD**");
  try {
    let response;
    response = await bdUtils.execute2();
    logger.info("Respuesta:", JSON.stringify(response));
    return res.status(200).send(response);
  } catch (e) {
    logger.error("upload Error:" + e.message);
    return res.status(500).send({ status: false, message: e.message });
  }
});

module.exports = router;
