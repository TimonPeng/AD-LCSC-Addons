const request = require("request");

const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const lcsc = require("./jsapi.min.js");

const app = express();
app.use(bodyParser.json());
app.use(morgan("combined"));
const port = 80;

app.get("/", (req, res) => {
  res.send(
    "<a href='https://github.com/TimonPeng/AD-LCSC-Addons'>https://github.com/TimonPeng/AD-LCSC-Addons</a>"
  );
});

app.post("/", (req, res) => {
  const { id } = req.body;

  let httpResponse = {};

  request(
    `https://lceda.cn/api/components/${id}`,
    function (error, response, body) {
      if (error) {
        httpResponse = {
          success: false,
          msg: "Failed to convert file"
        };
      }

      const { result } = JSON.parse(body);

      const { title, dataStr, packageDetail } = result;

      try {
        const schFile = lcsc.JSAPI.easyeda2altium(
          title,
          JSON.stringify(dataStr)
        );
        const pcbFile = lcsc.JSAPI.easyeda2altium(
          title,
          JSON.stringify(packageDetail.dataStr)
        );

        // console.log(schFile);
        // console.log(pcbFile);

        let convertFailed = false;

        schFile.forEach(function (element) {
          if (element.includes("WARNING")) {
            convertFailed = true;
          }
        });
        pcbFile.forEach(function (element) {
          if (element.includes("WARNING")) {
            convertFailed = true;
          }
        });

        if (convertFailed) {
          httpResponse = {
            success: false,
            msg: "Failed to convert file"
          };
        } else {
          httpResponse = {
            success: true,
            result: { sch: schFile, pcb: pcbFile }
          };
        }
      } catch (e) {
        httpResponse = {
          success: false,
          msg: "Failed to convert file"
        };
      }

      // console.log(httpResponse);
      res.json(httpResponse);
    }
  );
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
