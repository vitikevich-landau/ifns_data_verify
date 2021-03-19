const _ = require("lodash");
const axios = require("axios");
const { third } = require("./mixins");
const { DbInstance } = require("./db");
const { File } = require("./files");

const sendToMyChat = async (diff) => {
  let recipients;

  recipients = (await DbInstance.selectRecipients()).rows.map(third);
  // recipients = ["35" /*'7'*/];

  const lines = diff.map((v) => `${v.inn}\r\n${v.name}`);

  let chunked;
  if (diff.length > 15) {
    chunked = _.chunk(lines, 100);
  } else {
    chunked = lines;
  }

  /***
   *  Если в результирующем массиве есть такие-то записи,
   *  то отправляем сообщение пользователю
   */
  for (const recipient of recipients) {
    /***
     *  Свой номер для каждого получателя
     * */
    let i = 1;
    /***
     *  Send by chunks
     * */
    for (const chunk of chunked) {
      const msg = !!chunk?.join
        ? `Изменились наименования: №${i}\r\n${chunk.join("\r\n")}`
        : `Изменились наименования: \r\n${chunk}`;

      try {
        await axios.post("http://localhost:8185/api/mychat-send-messageto", {
          uinTo: recipient,
          msg,
        });
      } catch (e) {
        /***
         *  Save to log and send message to administrator
         * */
        console.log(e);

        File.log(e);

        /***
         *  Process exit
         *
         */
        throw e;
      }

      File.log(`Сообщение #${i} отправлено получателю: ${recipient}`);

      ++i;
    }
  }
};

module.exports = {
  sendToMyChat,
};
