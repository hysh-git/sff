const Table = require("tty-table");

// Sort function
function slastModifiedDate(a, b) {
  return (new Date(a.LastModifiedDate)).getTime() - (new Date(b.LastModifiedDate)).getTime();
}

function printUsage() {
  console.log(" sff .. Downloads attachments from SalesForce to current directory");
  console.log(" == USAGE ==");
  console.log(" # sff <CaseNumber> [-a] [file1 file2 file3...]");
  console.log(" # sff 00001234                 ........  List Attachment");
  console.log(" # sff 00001234 file1 file2     ........  Download Attachments");
  console.log(" # sff 00001234 -a              ........  Download All Attachments");
  process.exit(1);
}

function maxFIleLength(rAttachment) {
  return rAttachment
    .map((x) => {
      let fileLength;
      if (x.Title !== undefined) {
        fileLength = x.Title.length;
      } else if (x.Name !== undefined) {
        fileLength = x.Name.length;
      } else {
        fileLength = 10; // Minimun is 10
      }
      return fileLength;
    }).sort().pop();
}


function humanBytes(bytes) {
  if (bytes === 0) { return "0.00 B"; }
  const e = Math.floor(Math.log(bytes) / Math.log(1024));
  // eslint-disable-next-line no-restricted-properties
  return `${(bytes / Math.pow(1024, e)).toFixed(2)} ${" KMGTP".charAt(e)}B`;
}

// Header of List Attachment
const laHeader = [
  {
    alias: "ATTACHMENTS",
    value: "fname",
    headerColor: "cyan",
    color: "white",
    align: "left",
    paddingLeft: 2,
    width: 3,
  },
  {
    alias: "LAST MODIFIED",
    value: "ldate",
    headerColor: "cyan",
    color: "white",
    align: "right",
    width: 25,
  },
  {
    alias: "SIZE",
    value: "size",
    headerColor: "cyan",
    align: "right",
    color: "white",
    width: 15,
  },
];

const laOptions = {
  borderStyle: 1,
  borderColor: "blue",
  headerAlign: "center",
  align: "left",
  color: "white",
  compact: true,
  truncate: "...",
};

module.exports = {

  checkUserPass() {
    let errorExit = false;

    if (process.env.SFF_USER === undefined
      || process.env.SFF_USER === null
      || process.env.SFF_USER.length === 0) {
      console.error(" ");
      console.error(" SFF_USER is node set. ");
      console.error(" example)");
      console.error(" $ export SFF_USER=xxxxxxxxxx  on Mac/Linux");
      console.error(" > set SFF_USER=xxxxxxxxxx on Windows cmd");
      console.error(" > set $env:SFF_USER=\"xxxxxxxxxx\" on Windows PowerShell");
      errorExit = true;
    }

    if (process.env.SFF_PASSTOKEN === undefined
      || process.env.SFF_PASSTOKEN === null
      || process.env.SFF_PASSTOKEN.length === 0) {
      console.error(" ");
      console.error(" SFF_PASSTOKEN is node set. ");
      console.error(" example)");
      console.error(" $ export SFF_PASSTOKEN=yyyyyyyyyyzzzzzzzz  on Mac/Linux");
      console.error(" > SFF_PASSTOKEN=yyyyyyyyyyzzzzzzzz on Windows");
      console.error(" > set $env:SFF_PASSTOKEN=\"xxxxxxxxxx\" on Windows PowerShell");
      errorExit = true;
    }

    if (errorExit) process.exit(1);
  },

  printAttachments(rAttachment, rCaseFeed) {
    const laRows = [];

    laHeader.filter((i) => i.value === "fname")[0].width += maxFIleLength(rAttachment);

    rCaseFeed.concat(rAttachment).sort(slastModifiedDate).forEach((x) => {
      if (x.Title !== undefined) {
        laRows.push(
          { fname: x.Title, ldate: (new Date(x.LastModifiedDate)).toLocaleString(), size: "--" },
        );
      } else if (x.Name !== undefined) {
        laRows.push(
          // eslint-disable-next-line max-len
          { fname: x.Name, ldate: (new Date(x.LastModifiedDate)).toLocaleString(), size: humanBytes(x.BodyLength) },
        );
      }
    });

    console.log(Table(laHeader, laRows, laOptions).render());
  },

  checkArgs(argv) {
    const argvLength = argv.length;
    const mode = {
      LIST: false,
      DOWNLOAD: false,
      FILES: [],
      CASENUM: "",
    };

    if (argvLength < 3) {
      printUsage();
    } else {
      // eslint-disable-next-line prefer-destructuring
      mode.CASENUM = argv[2];

      if (!/^[0-9]*$/.test(mode.CASENUM)) {
        console.error(` CaseNumber should contain only Numbers. Input was [ ${mode.CASENUM} ]`);
        printUsage();
      }

      if (argvLength === 3) {
        mode.LIST = true;
      } else if ((argvLength === 4) && (argv[3] === "-a")) {
        console.log("ALL SELECTED");
      } else {
        mode.DOWNLOAD = true;
        for (let n = 3; n < argvLength; n += 1) {
          mode.FILES.push(argv[n]);
        }
      }
    }
    return mode;
  },
};
