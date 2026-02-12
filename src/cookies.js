/**
 * :: cookies.js ::
 *
 * A complete cookies reader/writer framework with full unicode support.
 *
 * https://developer.mozilla.org/zh-CN/docs/DOM/document.cookie
 *
 * This framework is released under the GNU Public License, version 3 or later.
 * http://www.gnu.org/licenses/gpl-3.0-standalone.html
 *
 * Syntaxes:
 *
 * * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
 * * docCookies.getItem(name)
 * * docCookies.removeItem(name[, path], domain)
 * * docCookies.hasItem(name)
 * * docCookies.keys()
 */
export default {
    "getItem": function (sKey) {
        return (
            decodeURIComponent(
                document.cookie.replace(
                    new RegExp(
                        `(?:(?:^|.*;)\\s*${encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&")
                        }\\s*\\=\\s*([^;]*).*$)|^.*$`,
                    ),
                    "$1",
                ),
            ) || null
        );
    },
    "hasItem": function (sKey) {
        return new RegExp(
            `(?:^|;\\s*)${encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&")
            }\\s*\\=`,
        ).test(document.cookie);
    },
    "keys": /* optional method: you can safely remove it! */ function () {
        // 1. 获取 cookie 字符串，若为空直接返回空数组
        const cookieStr = document.cookie;
        if (!cookieStr) {
            return [];
        }

        // 2. 按 ';' 分割字符串
        // 3. 遍历每一项，提取 '=' 之前的部分作为键名
        // 4. 进行 trim 和 decodeURIComponent 处理
        return cookieStr.split(';')
            .map(cookie => {
                // 即使值中包含 '='，split 只切分第一个 '=' 也是安全的，
                // 但这里我们只需要键，所以直接取第一部分即可
                const key = cookie.split('=')[0];
                return key ? decodeURIComponent(key.trim()) : '';
            })
            .filter(key => key !== ''); // 过滤掉可能产生的空字符串
    },
    "removeItem": function (sKey, sPath, sDomain) {
        if (!sKey || !this.hasItem(sKey)) {
            return false;
        }
        document.cookie =
            `${encodeURIComponent(sKey)
            }=; expires=Thu, 01 Jan 1970 00:00:00 GMT${sDomain ? `; domain=${sDomain}` : ""
            }${sPath ? `; path=${sPath}` : ""}`;
        return true;
    },
    "setItem": function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max-age|path|domain|secure)$/i.test(sKey)) {
            return false;
        }
        let sExpires = "";
        if (vEnd) {
            switch (vEnd.constructor) {
                case Number:
                    sExpires =
                        vEnd === Infinity
                            ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT"
                            : `; max-age=${vEnd}`;
                    break;
                case String:
                    sExpires = `; expires=${vEnd}`;
                    break;
                case Date:
                    sExpires = `; expires=${vEnd.toUTCString()}`;
                    break;
                default:
                    throw new Error(`${vEnd} can not be used as a date.`);
            }
        }
        document.cookie =
            `${encodeURIComponent(sKey)
            }=${encodeURIComponent(sValue)
            }${sExpires
            }${sDomain ? `; domain=${sDomain}` : ""
            }${sPath ? `; path=${sPath}` : ""
            }${bSecure ? "; secure" : ""}`;
        return true;
    },
};
