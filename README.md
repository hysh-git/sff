# sff
Simple command line tool to download Attachments from Salesforce Case.

## Intallation
```bash
$ npm install -g @hysh/sff
```
# User /  Pass +Token
USERNAME and PASSWORD+TOKEN hash to be set as Environment Variable to download files.
TOKEN is available from here. (https://help.salesforce.com/articleView?id=user_security_token.htm&type=5)

Note: This tool uses REST API to Salesforce. Please refere [here](https://developer.salesforce.com/docs/atlas.en-us.salesforce_app_limits_cheatsheet.meta/salesforce_app_limits_cheatsheet/salesforce_app_limits_platform_api.htm) for the limits.

```bash
- Mac/Unix
$ export SFF_USERNAME=yourname@company.com
$ export SFF_PASSROKEN=passwordtoken

- Windows powershell
> set $env:SFF_USERNMAE="username"
> set $env:SFF_PASSTOKEN="passwordtoken"

- Windows CMD
> set SFF_USERNMAE="username"
> set SFF_PASSTOKEN="passwordtoken"
```

```bash
$ sff
 sff .. Downloads attachments from SalesForce to current directory
 == USAGE ==
 # sff <CaseNumber> [-a] [file1 file2 file3...]
 # sff 00001234                 ........  List Attachment
 # sff 00001234 file1 file2     ........  Download Attachments
 # sff 00001234 -a              ........  Download All Attachments
```
