import metadata from "./metadata.js";
import docCookies from './cookies.js';

const generateHeader = () => ({
    "accept": "application/json, text/plain, */*",
    "accept-language": "zh",
    "content-type": "application/json",
    "sec-ch-ua": "\"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"144\", \"Google Chrome\";v=\"144\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "timeout": "300000",
    "workspaceid": metadata.personal,
    "x-csrf-token": docCookies.getItem('x-csrf-token'),
    "x-top-region": "cn-north-1"
});

const fetchAppConfig = async () => fetch("https://hia.volcenginepaas.com/api/app?Action=GetAppConfig&Version=2023-08-01", {
    "headers": generateHeader(),
    "referrer": window.location.pathname,
    "body": `{\"AppID\":\"${metadata.application}\",\"WorkspaceID\":\"${metadata.personal}\"}`,
    "method": "POST",
    "mode": "cors",
    "credentials": "include"
}).then(res => res.json()).then(json => json.Result);

export default {
    "getPrompt": async () => fetchAppConfig().then(result => result.AppConfigDraft.PrePrompt),
    "setPromt": async (prompt) => {
        const AppConfigDraft = await fetchAppConfig().then(result => result.AppConfigDraft);
        AppConfigDraft.PrePrompt = prompt;
        const requestBody = {
            "AppID": metadata.application,
            AppConfigDraft,
            "WorkspaceID": metadata.personal,
        };
        await fetch("https://hia.volcenginepaas.com/api/app?Action=SaveAppConfigDraft&Version=2023-08-01", {
            "headers": generateHeader(),
            "referrer": window.location.pathname,
            "body": JSON.stringify(requestBody),
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });
    },
}
