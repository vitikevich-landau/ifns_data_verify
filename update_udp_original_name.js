const { load } = require("./api_loader");
const { DbInstance } = require("./db");
const { File } = require("./files");

/***
 *  Update делать каждый день для всех записей ???
 * */
const update = async () => {
  const TB_NAME = "AGNLIST";

  /***
   *  Waiting for loading
   * */
  const results = await load();

  /**
   *  Prepare bindings for update
   * */
  const binds = results.map((v) => ({
    inn: v.inn,
    originalName: v.full_with_opf,
  }));

  const affected = await DbInstance.executeMany(
    `
    update 
        ${TB_NAME}
    set 
        ORIGINAL_NAME = :originalName
    where 
        AGNIDNUMB = :inn
  `,
    binds
  );

  console.log(affected);

  File.log(`Изменено записей: ${JSON.stringify(affected)}`);
};

module.exports = {
  update,
};
