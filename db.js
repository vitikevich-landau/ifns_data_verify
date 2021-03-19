const oracleDb = require("oracledb");
const { File } = require("./files");

class Db {
  static AGNLIST_TABLE = "AGNLIST";

  static #connectOptions = {
    user: "PARUS",
    password: "123z",
    connectString: "192.168.1.112/UDPPA",
  };

  static #instance;

  #connection;

  constructor() {
    this.#connection = null;
    if (!Db.#instance) {
      Db.#instance = this;
    }
    return Db.#instance;
  }

  /**
   *  Builder
   * @returns {Promise<Db>}
   */
  #tryCatchFinally = async (executor) => {
    try {
      /***
       *  Connecting to Db on every request
       */
      this.#connection = await oracleDb.getConnection(Db.#connectOptions);

      return await executor();
    } catch (err) {
      /***
       *  TODO if something wrong
       */
      console.error(err);
      File.log(err);
    } finally {
      if (this.#connection) {
        try {
          await this.#connection.close();
        } catch (err) {
          /***
           *  LOG if can't close connection
           */
          console.error(err);
          File.log(err);
        }
      }
    }
  };

  execute = async (sql) =>
    await this.#tryCatchFinally(
      async () => await this.#connection.execute(sql)
    );
  executeMany = async (sql, binds = [], options = {}) =>
    await this.#tryCatchFinally(
      async () =>
        await this.#connection.executeMany(sql, binds, {
          autoCommit: true,
          ...options,
        })
    );

  selectINNs = async () =>
    await this.execute(
      `
          select 
              A.AGNIDNUMB,
              A.AGNNAME,
              A.FULLNAME,
              A.ORIGINAL_NAME,
              A.RN
          from
              V_CLIENTCLIENTS   C
              left join ${Db.AGNLIST_TABLE}           A
              on A.RN = C.NCLIENT_AGENT
          where
              A.AGNTYPE = 0
              and C.NCRN in (
                  74311,
                  55900,
                  1154790,
                  1154178,
                  1154309,
                  1583018,
                  1153886,
                  1154523,
                  1154017,
                  841772,
                  55990,
                  56080,
                  56125,
                  56215,
                  56260,
                  56350,
                  56305,
                  56395,
                  56440,
                  56485,
                  56981,
                  57026,
                  57161,
                  57206,
                  57251,
                  57296,
                  57386,
                  57431,
                  57476,
                  57521,
                  57566
              )
              and A.RN not in (
            select 
              A.RN
            from
                V_CLIENTCLIENTS   C
                left join ${Db.AGNLIST_TABLE}           A
                on A.RN = C.NCLIENT_AGENT
            where
                A.AGNTYPE = 0
                and C.NCRN in (
                    74311,
                    55900,
                    1154790,
                    1154178,
                    1154309,
                    1583018,
                    1153886,
                    1154523,
                    1154017,
                    841772,
                    55990,
                    56080,
                    56125,
                    56215,
                    56260,
                    56350,
                    56305,
                    56395,
                    56440,
                    56485,
                    56981,
                    57026,
                    57161,
                    57206,
                    57251,
                    57296,
                    57386,
                    57431,
                    57476,
                    57521,
                    57566
                )
                and ( LENGTH(A.AGNIDNUMB) != 10
                      or A.AGNIDNUMB is null )
            
                )
    `
    );

  selectRecipients = async () =>
    await this.execute(`
    select * from V_EXTRA_DICTS_VALUES where NPRN=7152143
  `);
}

module.exports = {
  DbInstance: new Db(),
};
