#!/usr/bin/env node
const utils = require("./lib/utils.js");
const sff = require("./lib/sff.js");

const mode = utils.checkArgs(process.argv);

utils.checkUserPass();

if (mode.LIST) {
  sff.listAttachments(mode.CASENUM);
} else {
  sff.download(mode.CASENUM, mode.FILES);
}
