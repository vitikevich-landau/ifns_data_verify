const _ = require("lodash");
const axios = require("axios");
const { DbInstance } = require("./db");
const { first, third, fourth } = require("./mixins");
const { sendToMyChat } = require("./notification");
const { update } = require("./update_udp_original_name");
const { File } = require("./files");

(async () => {
  /***
   *  Update original names
   *
   *  Если нет соединеняи с БД при выборке и после скачки
   *  при обновлнеии, пусть скрипт падает! (задачу он не выполнил)
   * */
  await update();

  const { rows } = await DbInstance.selectINNs();

  const fullNames = rows.map((v) => ({
    inn: first(v),
    name: third(v)?.toUpperCase(),
  }));
  const originalNames = rows.map((v) => ({
    inn: first(v),
    name: fourth(v)?.toUpperCase(),
  }));

  /***
   *  Order is important
   * */
  const diff = _.differenceWith(originalNames, fullNames, _.isEqual);

  console.log(`diff: ${diff.length}`);

  File.log(`Полей отличается: ${diff.length}`);

  if (diff.length) {
    await sendToMyChat(diff);

    /***
     *  Send message to administrator
     *
     */
    await axios.post("http://localhost:8185/api/mychat-send-messageto", {
      uinTo: 35,
      msg: "ifns_data_verify completed!",
    });
  }

  File.log(`...Completed...`);
})();
