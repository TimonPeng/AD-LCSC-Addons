var VERSION = "0.1.0-beta";

var wScriptShell = new ActiveXObject("WScript.Shell");
var installFolder = wScriptShell.SpecialFolders("MyDocuments");
var installedDir = installFolder + "\\AD-LCSC-Addons";
var cacheDir = installedDir + "\\cache";
var downloadDir = installedDir + "\\download";

// json
var JSON = {
  parse: function (jsonStr) {
    return eval("(" + jsonStr + ")");
  },
  stringify: function (jsonObj) {
    var result = "",
      curVal;
    if (jsonObj === null) {
      return String(jsonObj);
    }
    switch (typeof jsonObj) {
      case "number":
      case "boolean":
        return String(jsonObj);
      case "string":
        return '"' + jsonObj + '"';
      case "undefined":
      case "function":
        return undefined;
    }

    switch (Object.prototype.toString.call(jsonObj)) {
      case "[object Array]":
        result += "[";
        for (var i = 0, len = jsonObj.length; i < len; i++) {
          curVal = JSON.stringify(jsonObj[i]);
          result += (curVal === undefined ? null : curVal) + ",";
        }
        if (result !== "[") {
          result = result.slice(0, -1);
        }
        result += "]";
        return result;
      case "[object Date]":
        return (
          '"' + (jsonObj.toJSON ? jsonObj.toJSON() : jsonObj.toString()) + '"'
        );
      case "[object RegExp]":
        return "{}";
      case "[object Object]":
        result += "{";
        for (i in jsonObj) {
          if (jsonObj.hasOwnProperty(i)) {
            curVal = JSON.stringify(jsonObj[i]);
            if (curVal !== undefined) {
              result += '"' + i + '":' + curVal + ",";
            }
          }
        }
        if (result !== "{") {
          result = result.slice(0, -1);
        }
        result += "}";
        return result;

      case "[object String]":
        return '"' + jsonObj.toString() + '"';
      case "[object Number]":
      case "[object Boolean]":
        return jsonObj.toString();
    }
  }
};

// i18n
var messages = {
  "zh-CN": {
    "Search": "����",
    "Pagination": "��ҳ",
    "Please enter search keyword": "�����������ؼ���",
    "Response failed: ": "����ʧ�ܣ�",
    ", return code: ": "�����ش��룺",
    "Request failed, return code: ": "����ʧ�ܣ����ش��룺",
    "Request failed, please check your network": "����ʧ�ܣ���������״��",
    "No result": "�޽��",
    // ���������ͷ
    "Title(PartNO)": "����(�������)",
    "Footprint": "��װ",
    "Value": "ֵ",
    "Manufacturer": "������",
    "SMT": "��Ƭ",
    "SMT Type": "��Ƭ����",
    "Description": "����",
    "Y": "��",
    "Basic": "����",
    "Extend": "��չ",
    // info
    "$": "��",
    "LCSC Part#: ": "�����̳Ǳ�ţ�",
    "Advertising": "���λ����",
    "Request document infomations failed": "�����ĵ���Ϣʧ��",
    "Convert document failed": "ת���ļ�ʧ��",
    "A schematic document (*.SchDoc) or pcb document (*.PcbDoc) must be opened":
      "���ȴ�һ��ԭ��ͼ�ļ� (*.SchDoc) �� ��װ���ļ� (*.PcbDoc)"
  }
};

// read config
var fso = new ActiveXObject("Scripting.FileSystemObject");
var configFile = installedDir + "\\config.json";
var configObject = fso.OpenTextFile(installedDir + "\\config.json", 1);
var config = JSON.parse(configObject.ReadAll());

// set search source
var searchSource = config["searchSource"] || "SZLCSC";
var searchApi, imageApi, listApi;
if (searchSource === "SZLCSC") {
  searchApi = "https://lceda.cn/api";
  imageApi = "https://image.lceda.cn/components/";
  listApi = "https://list.szlcsc.com/eda/product/img/";
} else if (searchSource === "LCSC") {
  searchApi = "https://easyeda.com/api";
  imageApi = "https://image.easyeda.com/components/";
  listApi = "https://lcsc.com/api/eda/product/img/";
}

var edaVersion = "6.4.7";

// convert server
var convertApi = "http://127.0.0.1:1456";

// i18n
var locale = config["locale"] || "en";

function i18n(key) {
  if (!messages.hasOwnProperty(locale)) {
    return key;
  }

  if (messages[locale].hasOwnProperty(key)) {
    return messages[locale][key];
  }

  return key;
}

// pre check
function Prechecks() {
  Client.StartServer("SCH");

  MainForm.Show();
}

// main show callback
function onMainShow(Sender) {
  // set main form title
  MainForm.Caption =
    "AD LCSC Addons v" +
    VERSION +
    " - by Timon" +
    ", JScript " +
    ScriptEngineMajorVersion() +
    "." +
    ScriptEngineMinorVersion();

  // make main form center
  MainForm.Left = (screen.width - MainForm.ClientWidth) / 2;
  MainForm.Top = (screen.height - MainForm.ClientHeight) / 2;

  // set element position and size
  // SearchSource
  // setClientWidth(SearchSource, 200);
  // setClientHeight(SearchSource, 60);
  // setHeight(SearchSource, 60);
  // setLeft(SearchSource, 10);
  // SearchGroup
  // setClientWidth(SearchGroup, 770);
  // setClientHeight(SearchGroup, 60);
  // setLeft(SearchGroup, 220);

  // SearchButton
  SearchButton.Caption = i18n("Search");

  // SearchResult
  resetSearchResult();

  // PageGroup
  PageGroup.Caption = i18n("Pagination");
  // PagePrevious
  PagePrevious.Enabled = false;
  // PageNext
  PageNext.Enabled = false;

  Advertising.Caption = i18n("Advertising");
}

function autoSizeCol(colNumber) {
  var maxWidth = SearchResult.ColWidths(colNumber);

  for (var i = 1; i < SearchResult.RowCount; i++) {
    var width = SearchResult.Canvas.TextWidth(SearchResult.Cells(colNumber, i));
    if (width > maxWidth) {
      maxWidth = width;
    }
  }

  SearchResult.ColWidths(colNumber) = maxWidth + 10;
}

var searchResultHead = [
  i18n("Title(PartNO)"),
  i18n("Footprint"),
  i18n("Value"),
  i18n("Manufacturer"),
  i18n("SMT"),
  i18n("SMT Type"),
  i18n("Description")
];

// reset table
function resetSearchResult() {
  SearchResult.RowCount = 1;

  for (var i = 0; i < searchResultHead.length; i++) {
    SearchResult.Cols(i)(0) = searchResultHead[i];

    autoSizeCol(i);
  }
}

// global
var currentPage = 1;
var keyword = "";

function onSearch(Sender) {
  currentPage = 1;
  keyword = "";

  if (!SearchInput.Text) {
    ShowMessage(i18n("Please enter search keyword"));
  } else {
    keyword = SearchInput.Text;
    searchKeyword(currentPage);
  }
}

var networkError = {
  error: true,
  status: -1,
  msg: "Request failed, please check your network",
  response: null
};

// request json with error handle
// https://github.com/erthe/ircscripts/blob/9c90a8f27942558e5a07629822ad8ba71179566f/stream.js
// https://github.com/romgrk/ol-resources/blob/35c014e7f1a9a16fba7c83b56bb7676ede40073f/jscript.js
function fetch(options, callback) {
  var xhr = new ActiveXObject("Msxml2.ServerXMLHTTP.3.0");

  // dns
  var lResolve = 5 * 1000;
  // connect
  var lConnect = 5 * 1000;
  // post
  var lSend = 15 * 1000;
  // receive
  var lReceive = 15 * 1000;
  xhr.setTimeouts(lResolve, lConnect, lSend, lReceive);

  var url = options.url;
  var method = options.method || "GET";
  var isAsync = options.async;
  var isJSON = false;

  if (options.data && method === "GET") url += "?" + queryString(options.data);

  try {
    xhr.open(method, url, isAsync);
  } catch (error) {
    return callback(networkError);
  }

  if (options.headers) {
    for (var name in options.headers) {
      var value = options.headers[name];
      if (name === "Content-Type" && value === "application/json") {
        isJSON = true;
      }
      xhr.setRequestHeader(name, value);
    }
  }

  function send() {
    try {
      if (isJSON && method === "POST" && typeof options.data == "object") {
        xhr.send(JSON.stringify(options.data));
      } else if (options.data && method === "POST") {
        xhr.send(options.data);
      } else {
        xhr.send(null);
      }
    } catch (error) {
      return callback(networkError);
    }
  }

  function getResult() {
    // ShowMessage(xhr.status);

    if (xhr.status >= 300) {
      return {
        error: true,
        status: xhr.status,
        msg: xhr.statusText,
        response: xhr.responseText
      };
    }
    if (
      xhr.getResponseHeader("Content-Type").indexOf("application/json") !== -1
    ) {
      return {
        error: false,
        status: xhr.status,
        response: JSON.parse(xhr.responseText)
      };
    }

    return {
      error: false,
      status: xhr.status,
      // responseStream
      response: xhr.responseBody
    };
  }

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      callback(getResult());
    }
  };
  send();
}

// Encode as application/x-www-form-urlencoded (see HTML specs)
function queryString(params) {
  var parts = [];
  for (var key in params) {
    parts.push(key + "=" + encodeURIComponent(params[key]));
  }
  return parts.join("&");
}

function getTimestamp() {
  return Math.round(new Date().getTime());
}

function forEach(a, d) {
  for (var e = new Enumerator(a); !e.atEnd(); e.moveNext()) {
    d(e.item());
  }
}

// reset button state
function resetState() {
  SearchButton.Enabled = false;

  PagePrevious.Enabled = false;
  PageNext.Enabled = false;

  Price.Caption = "";
  Details.Caption = "";
}

// table row's info flag
var titleFlag = 0;
var footprintFlag = 1;
var valueFlag = 2;
var manufacturerFlag = 3;
var smtFlag = 4;
var smtTypeFlag = 5;
var descriptionFlag = 6;
var partNumberFlag = 7;
var urlFlag = 8;
var priceFlag = 9;
var schIdFlag = 10;
var pcbIdFlag = 11;

function searchKeyword(page) {
  resetState();
  resetSearchResult();

  fetch(
    {
      "url": searchApi + "/components/search",
      "method": "POST",
      "async": true,
      "headers": { "Content-Type": "application/json" },
      "data": {
        "type": 3,
        "doctype[]": 2,
        "returnListStyle": "classifyarr",
        "wd": keyword,
        "version": edaVersion,
        "pageSize": 100,
        "page": page
      }
    },
    function (res) {
      if (res.error) {
        ShowMessage(i18n(res.msg));
      } else {
        var response = res.response;

        if (response && response.success === true && response.code === 0) {
          var result = response.result;
          var lcsc = result.lists.lcsc;

          if (lcsc.length === 0) {
            ShowMessage(i18n("No result"));
          } else {
            SearchResult.RowCount = lcsc.length + 1;

            var i = 1;

            forEach(lcsc, function (row) {
              var head = row.dataStr.head;
              var summary = head.c_para;

              // "Title(PartNO)"
              SearchResult.Cols(titleFlag)(i) = row.title;
              // "Footprint"
              SearchResult.Cols(footprintFlag)(i) = summary.package;
              // "Value"
              if (summary.Capacitance) {
                // F
                SearchResult.Cols(valueFlag)(i) = summary.Capacitance;
              } else if (summary.Frequency) {
                // MHZ
                SearchResult.Cols(valueFlag)(i) = summary.Frequency;
              } else if (summary["Resistance (Ohms)"]) {
                // R
                SearchResult.Cols(valueFlag)(i) = summary["Resistance (Ohms)"];
              } else if (summary.Value) {
                // R
                SearchResult.Cols(valueFlag)(i) = summary.Value;
              } else {
                SearchResult.Cols(valueFlag)(i) = "";
              }
              // "Manufacturer" with error handling, crashing alot
              if(summary.BOM_Manufacturer === undefined || summary.BOM_Manufacturer === null || summary.BOM_Manufacturer === "null"){
                summary.BOM_Manufacturer = "";
              }
                SearchResult.Cols(manufacturerFlag)(i) = summary.BOM_Manufacturer;
              
              // "SMT"
              if (summary["BOM_JLCPCB SMD"] === "Yes") {
                SearchResult.Cols(smtFlag)(i) = i18n("Y");
              } else {
                SearchResult.Cols(smtFlag)(i) = "";
              }
              // "SMT Type"
              if (summary["BOM_JLCPCB SMD"] === "Yes" && summary["SMT Type"]) {
                SearchResult.Cols(smtTypeFlag)(i) = i18n(summary["SMT Type"]);
              } else {
                SearchResult.Cols(smtTypeFlag)(i) = "";
              }
              // "Description"
              if (row.description) {
                SearchResult.Cols(descriptionFlag)(i) = row.description;
              } else if (row.description_cn) {
                SearchResult.Cols(descriptionFlag)(i) = row.description_cn;
              } else {
                SearchResult.Cols(descriptionFlag)(i) = "";
              }

              // hidden infomations
              // part number
              if (searchSource === "SZLCSC") {
                SearchResult.Cols(partNumberFlag)(i) = row.szlcsc.number;
              } else if (searchSource === "LCSC") {
                SearchResult.Cols(partNumberFlag)(i) = row.lcsc.number;
              } else {
                SearchResult.Cols(partNumberFlag)(i) = "";
              }

              // url
              if (searchSource === "SZLCSC") {
                SearchResult.Cols(urlFlag)(i) = row.szlcsc.url;
              } else if (searchSource === "LCSC") {
                SearchResult.Cols(urlFlag)(i) = row.lcsc.url;
              } else {
                SearchResult.Cols(urlFlag)(i) = "";
              }

              // price
              if (searchSource === "SZLCSC") {
                SearchResult.Cols(priceFlag)(i) = row.szlcsc.price;
              } else if (searchSource === "LCSC") {
                SearchResult.Cols(priceFlag)(i) = row.lcsc.price;
              } else {
                SearchResult.Cols(priceFlag)(i) = "";
              }

              // sch uuid
              SearchResult.Cols(schIdFlag)(i) = head.uuid;
              // pcb uuid
              SearchResult.Cols(pcbIdFlag)(i) = head.puuid;

              i += 1;
            });

            for (var i = 0; i < searchResultHead.length; i++) {
              autoSizeCol(i);
            }

            currentPage = parseInt(result.page);
            var totalPage = parseInt(result.totalPage);

            PageCurrent.Caption = currentPage + "/" + totalPage;

            if (currentPage > 1) {
              PagePrevious.Enabled = true;
            } else {
              PagePrevious.Enabled = false;
            }

            if (totalPage > currentPage) {
              PageNext.Enabled = true;
            } else {
              PageNext.Enabled = false;
            }
          }
        } else {
          i18n("Request failed, return code: ") + res.status;
        }
      }

      SearchButton.Enabled = true;
    }
  );
}

function onEnter(Sender, Key) {
  if (Key === "\r" || Key === 13) {
    onSearch();
  }
}

function onPagePrevious() {
  searchKeyword(currentPage - 1);
}

function onPageNext() {
  searchKeyword(currentPage + 1);
}

var convertResponseBodyToText = function (binary) {
  // https://stackoverflow.com/questions/1919972/how-do-i-access-xhr-responsebody-for-binary-data-from-javascript-in-ie
  var byteMapping = {};
  for (var i = 0; i < 256; i++) {
    for (var j = 0; j < 256; j++) {
      byteMapping[String.fromCharCode(i + j * 256)] =
        String.fromCharCode(i) + String.fromCharCode(j);
    }
  }
  // call into VBScript utility fns
  var rawBytes = IEBinaryToArray_ByteStr(binary);
  var lastChr = IEBinaryToArray_ByteStr_Last(binary);
  return (
    rawBytes.replace(/[\s\S]/g, function (match) {
      return byteMapping[match];
    }) + lastChr
  );
};

function convertStringToHex(str) {
  // http://www.liangshunet.com/en/202005/332182170.htm
  var hex = "";
  for (var i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16).slice(-4).toUpperCase();
  }
  return hex;
}

function onPartSelected(Sender) {
  var selected = SearchResult.Row;

  if (selected > 0) {
    var partNum = SearchResult.Cols(partNumberFlag)(selected);

    if (partNum) {
      Price.Caption = i18n("$") + SearchResult.Cols(priceFlag)(selected);
      Details.Caption = i18n("LCSC Part#: ") + partNum;

      // get sch image
      var schId = SearchResult.Cols(schIdFlag)(selected);
      fetch(
        {
          "url": imageApi + schId + ".png",
          "method": "GET",
          "async": true,
          "headers": {},
          "data": {}
        },
        function (res) {
          if (!res.error) {
            var response = res.response;
            // response typeof is unknown
            // var fileHex = convertStringToHex(convertResponseBodyToText(response));
            // SchImg.Picture.Data = "0954506E67496D616765" + fileHex;

            var stream = new ActiveXObject("ADODB.Stream");
            stream.Open();
            stream.Type = 1;
            stream.Write(response);
            stream.Position = 0;
            var savePath = cacheDir + "\\" + partNum + "_SCH.png";
            stream.savetofile(savePath, 2);

            // fix table rolling
            if (SearchResult.Cols(schIdFlag)(selected) === schId) {
              SchImg.Picture.LoadFromFile(savePath);
            }
          }
        }
      );

      // get pcb image
      var pcbId = SearchResult.Cols(pcbIdFlag)(selected);
      fetch(
        {
          "url": imageApi + pcbId + ".png",
          "method": "GET",
          "async": true,
          "headers": {},
          "data": {}
        },
        function (res) {
          if (!res.error) {
            var response = res.response;

            var stream = new ActiveXObject("ADODB.Stream");
            stream.Open();
            stream.Type = 1;
            stream.Write(response);
            stream.Position = 0;
            var savePath = cacheDir + "\\" + partNum + "_PCB.png";
            stream.savetofile(savePath, 2);

            if (SearchResult.Cols(pcbIdFlag)(selected) === pcbId) {
              PcbImg.Picture.LoadFromFile(savePath);
            }
          }
        }
      );

      // preview image removed due to dead api endpoint
    }
  }
}

function getCurrentSch() {
  if (SchServer === null) {
    return;
  }
  var sch = SchServer.GetCurrentSchDocument;

  return sch;
}

function getCurrentPcb() {
  if (PCBServer === null) {
    return;
  }
  var pcb = PCBServer.GetCurrentPCBBoard;

  return pcb;
}

function onPartPlace(Sender) {
  var selected = SearchResult.Row;

  if (selected > 0) {
    // var currentSch = getCurrentSch();
    // var currentPcb = getCurrentPcb();
    // if (!currentSch && !currentPcb) {
    //   ShowMessage(
    //     i18n(
    //       "A schematic document (*.SchDoc) or pcb document (*.PcbDoc) must be opened"
    //     )
    //   );
    // } else if (currentSch) {
    // } else {
    // }

    var schID = SearchResult.Cols(schIdFlag)(selected);

    fetch(
      {
        "url": convertApi,
        "method": "POST",
        "async": true,
        "headers": { "Content-Type": "application/json" },
        "data": { "id": schID }
      },
      function (res) {
        if (res.error) {
          ShowMessage(i18n(res.msg));
        } else {
          var response = res.response;

          if (response && response.success) {
            var result = response.result;

            var schFile = result.sch;
            var pcbFile = result.pcb;

            var partNum = SearchResult.Cols(partNumberFlag)(selected);

            if (typeof schFile === "object" && schFile.length > 0) {
              var fso = new ActiveXObject("Scripting.FileSystemObject");
              var saveSchPath = downloadDir + "\\" + partNum + ".schdoc";
              var f = fso.createTextfile(saveSchPath, True);
              forEach(schFile, function (line) {
                f.Write(line);
              });
              f.Close();

              var schDoc = Client.OpenDocument("Sch", saveSchPath);
              Client.ShowDocument(schDoc);
            }

            if (typeof pcbFile === "object" && schFile.length > 0) {
              var fso = new ActiveXObject("Scripting.FileSystemObject");
              var savePcbPath = downloadDir + "\\" + partNum + ".pcbdoc";
              var f = fso.createTextfile(savePcbPath, True);
              forEach(pcbFile, function (line) {
                f.Write(line);
              });
              f.Close();

              var pcbDoc = Client.OpenDocument("Pcb", savePcbPath);
              Client.ShowDocument(pcbDoc);
            }
          } else {
            ShowMessage(i18n("Convert document failed"));
          }
        }
      }
    );
  }
}

function onMouseMove(Sender, Shift, X, Y) {
  Sender.Cursor = crHandPoint;
}

function onOpenDetails(Sender) {
  var selected = SearchResult.Row;

  new ActiveXObject("WScript.Shell").Run(SearchResult.Cols(urlFlag)(selected));
}
