const jsforce = require("jsforce");

const conn = new jsforce.Connection();
const request = require("request");
const fs = require("fs");

module.exports = {

  login(cb) {
    conn.login(process.env.SFF_USER, process.env.SFF_PASSTOKEN, (err) => {
      if (err) {
        console.log(" Failed to Login to SalesForce ");
        console.log(err);
        process.exit(1);
      }
      cb();
    });
  },
  getCaseId(caseNum, cb) {
    conn.sobject("Case")
      .select("Id")
      .where(`CaseNumber = '${caseNum}'`)
      .execute((err, records) => {
        if (err) {
          console.err(" Failed to get Case Id ");
          console.err(err);
          process.exit(1);
        }

        if (records.length > 0) {
          cb(records[0].Id);
        } else {
          cb(null);
        }
      });
  },
  getAttachment(caseId, cb) {
    conn.sobject("Attachment")
      .select("*")
      .where(`ParentId = '${caseId}'`)
      .execute((err, recordsAttachment) => {
        if (err) {
          console.err("Failed to get Attachment ");
          console.err(err);
          process.exit(1);
        }
        cb(recordsAttachment);
      });
  },
  getCaseFeed(caseId, cb) {
    conn.sobject("CaseFeed")
      .select("*")
      .where(`ParentId = '${caseId}' AND Type = 'ContentPost'`)
      .execute((err, recordsCaseFeed) => {
        if (err) {
          console.err("Failed to get CaseFeed ");
          console.err(err);
          process.exit(1);
        }

        cb(recordsCaseFeed);
      });
  },

  getFeedAttachment(v, cb) {
    console.log("getFeedAttachment");

    conn.sobject("FeedAttachment")
      .select("*")
      .where(`FeedEntityId = '${v.Id}'`)
      .execute((err, rval) => {
        if (err) {
          console.err("Failed to get FeedAttachment ");
          console.err(err);
          process.exit(1);
        }

        const recordFeedAttachment = rval;

        for (let i; i < recordFeedAttachment.length; i += 1) {
          recordFeedAttachment[i].Title = v.Title;
        }

        cb(null, recordFeedAttachment);
      });
  },

  download(v, cb) {
    let fileName;
    let tmpConn;
    if (v.Name !== undefined) {
      tmpConn = conn.sobject("Attachment").record(v.Id).blob("Body");
      fileName = v.Name;
    } else if (v.RecordId !== undefined) {
      tmpConn = conn.sobject("ContentVersion").record(v.RecordId).blob("VersionData");
      fileName = v.Title;
    }

    const fileOut = fs.createWriteStream(fileName);

    process.stdout.write(`${fileName} `);

    tmpConn.callback = null;

    // eslint-disable-next-line max-len
    const req = request({ url: tmpConn.uri.href, headers: { Authorization: tmpConn.headers.Authorization } });

    let time1 = new Date().getTime();

    req.on("data", () => {
      const time2 = new Date().getTime();
      if (time2 - time1 > 50) {
        process.stdout.write(".");
        time1 = time2;
      }
    });
    req.on("error", (err) => {
      console.log(`DOWNLOAD FAILED ${v.Name}`);
      console.log(err);
      cb(null);
    });
    req.on("complete", () => {
      console.log(" Done");
      cb(null);
    });

    req.pipe(fileOut);
  },
};
