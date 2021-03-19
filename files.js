const fs = require("fs");
const path = require("path");
const { EOL } = require("os");
const { BASE_DIR } = require("./config");

/***
 *  Работа с файлами
 */
class File {
  static LOG = path.join(BASE_DIR, "log.txt");

  static log = (msg) =>
    File.save(File.LOG, `-------${new Date()}--------` + `\r\n` + msg);

  static save = (fName, data) =>
    fs.appendFile(fName, `${data}${EOL}`, { encoding: "utf-8" }, (e) => {
      if (e) {
        throw e;
      }

      console.log(
        `Запись в файл ${fName}, завершена... Записано ${data.length} байт`
      );
    });

  static deleteIfExists = (fName) => {
    if (fs.existsSync(fName)) fs.unlinkSync(fName);
  };
}

module.exports = {
  File,
};
