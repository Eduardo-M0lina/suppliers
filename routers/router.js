const express = require("express");
const logger = require("../config/loggerUtil");
const router = express.Router();

const uploadRouter = require("./uploadService");
const invoiceService = require("./invoiceService");

router.use((req, res, next) => {
  logger.info(`Called:  ${req.path}`);
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

router.use(uploadRouter);
router.use(invoiceService);

module.exports = router;
