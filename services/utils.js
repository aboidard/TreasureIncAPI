
export const computePageParams = function (page, limit) {
    let limitParam = parseInt(limit, 10)
    let pageParam = parseInt(page, 10)
    if (isNaN(limitParam) || isNaN(limitParam)) return [null, 0]
    return [limitParam, limitParam * pageParam]
}

export const generatePublicKey = function (length) {
    let result = '';
    let characters = '0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export const generatePrivateKey = function (length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export const generateRandomString = function (len) {
    return Math.random().toString(36).substring(2, len + 2);
}

//module.exports = { computePageParams, generatePublicKey, generatePrivateKey, generateRandomString }
