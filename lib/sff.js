/* eslint-disable max-len */
const async = require("async");
const sf = require("./sf.js");
const utils = require("./utils");

module.exports = {

  listAttachments(caseNum) {
    sf.login(() => {
      sf.getCaseId(caseNum, (caseId) => {
        sf.getAttachment(caseId, (rAttachment) => {
          sf.getCaseFeed(caseId, (rCaseFeed) => {
            utils.printAttachments(rAttachment, rCaseFeed);
          });
        });
      });
    });
  },
  download(caseNum, fList) {
    sf.login(() => {
      sf.getCaseId(caseNum, (caseId) => {
        sf.getAttachment(caseId, (rAttachment) => {
          async.eachLimit(rAttachment.filter((v) => ((fList.length > 0) ? fList.includes(v.Name) : true)), 1, sf.download, () => {
            console.log("Feed Area");

            sf.getCaseFeed(caseId, (rCaseFeed) => {
              async.mapLimit(rCaseFeed.filter((v) => ((fList.length > 0) ? fList.includes(v.Title) : true)), 1, sf.getFeedAttachment, (err, listOfId) => {
                async.eachLimit([].concat(...listOfId), 1, sf.download, () => {

                });
              });
            });
          });
        });
      });
    });
  },
};
