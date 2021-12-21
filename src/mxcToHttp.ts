/**
 * Encode a dictionary of query parameters.
 * Omits any undefined/null values.
 * @param {Object} params A dict of key/values to encode e.g.
 * {"foo": "bar", "baz": "taz"}
 * @return {string} The encoded string e.g. foo=bar&baz=taz
 */
function encodeParams(params: Record<string, string | number | boolean>): string {
    const searchParams = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
        if (val !== undefined && val !== null) {
            searchParams.set(key, String(val));
        }
    }
    return searchParams.toString();
}

export function getHttpUriForMxc(
    baseUrl: string,
    mxc: string,
    width: number,
    height: number,
    resizeMethod: string,
    allowDirectLinks = false,
): string {
    if (typeof mxc !== "string" || !mxc) {
        return '';
    }
    if (mxc.indexOf("mxc://") !== 0) {
        if (allowDirectLinks) {
            return mxc;
        } else {
            return '';
        }
    }
    let serverAndMediaId = mxc.slice(6); // strips mxc://
    let prefix = "/_matrix/media/r0/download/";
    const params: Record<string, string> = {};

    if (width) {
        params["width"] = Math.round(width).toString();
    }
    if (height) {
        params["height"] = Math.round(height).toString();
    }
    if (resizeMethod) {
        params["method"] = resizeMethod;
    }
    if (Object.keys(params).length > 0) {
        // these are thumbnailing params so they probably want the
        // thumbnailing API...
        prefix = "/_matrix/media/r0/thumbnail/";
    }

    const fragmentOffset = serverAndMediaId.indexOf("#");
    let fragment = "";
    if (fragmentOffset >= 0) {
        fragment = serverAndMediaId.substr(fragmentOffset);
        serverAndMediaId = serverAndMediaId.substr(0, fragmentOffset);
    }

    const urlParams = (Object.keys(params).length === 0 ? "" : ("?" + encodeParams(params)));
    return baseUrl + prefix + serverAndMediaId + urlParams + fragment;
}
