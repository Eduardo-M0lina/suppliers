const express = require("express");
const bodyParser = require('body-parser');
const router = require("./routers/router");
const fileUpload = require("express-fileupload");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(fileUpload());
const cors = require("cors");
app.use(cors());
app.use(router);

app.get("/", function (req, res) {
  res.send("api-suppliers!");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`El servidor está inicializado en el puerto ${PORT}`);
  console.log("Press Ctrl+C to quit.");
});
