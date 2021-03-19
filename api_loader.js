const fetch = require('node-fetch');
const _ = require('lodash');
const {DbInstance} = require('./db');
const {first} = require('./mixins');
const {File} = require('./files');
const {delay} = require('./mixins');

const load = async () => {
  const url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party";
  /***
   *  https://dadata.ru/profile/#info
   * */
  const token = "f6b5195c499f18a70ead13eae648fd9bac8d7fce";

  const options = {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": "Token " + token
    }
  };

  const res = await DbInstance.selectINNs();

  const {rows} = res;
  const inns = rows.map(first);
  const chunked = _.chunk(inns, 19);

  File.log(`Взято из БД: ${inns.length} записей`);

  /***
   *  return
   * */
  const results = [];

  /***
   *  Взять нужное количество элементов, разбить на чанки
   *  и выполнить по ним запросы с задержкой в 1-2 секунды
   * */
  let i = 1;
  for (const chunk of chunked) {
    /***
     *    Send requests to server
     * */
    let promises = chunk.map(v =>
      fetch(
        url,
        {
          body: JSON.stringify({query: v}),
          ...options
        }
      )
    );

    try {
      promises = await Promise.all(promises);
    } catch (e) {
      console.log(e);

      File.log(e);

      /***
       *  Process exit
       * */
      throw e;
    }

    promises = promises.map(v => v.text());

    const resultsJson = await Promise.all(promises);

    /***
     *    Extract the required data
     * */
    const parsed = resultsJson.map(v => {
      const {suggestions} = JSON.parse(v);
      const [item] = suggestions
      const {data} = item;
      const {inn, state, name, kpp} = data;
      const {status} = state;
      const {full_with_opf} = name;

      return {inn, kpp, status, full_with_opf};
    });

    results.push(...parsed);

    const logMsg = `Part #${i}. Загружено: ${results.length} из ${inns.length}`;

    console.log(logMsg);

    File.log(logMsg);
    /***
     *  increment counter
     * */
    ++i;

    /***
     *  Delay between requests
     * */
    await delay(1000);
  }

  File.log(`Загружено с сайта: ${results.length} записей`);

  return results;
};

module.exports = {
  load
}
