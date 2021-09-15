
function computePageParams(page, limit) {
    let limitParam = parseInt(limit, 10)
    let pageParam = parseInt(page, 10)
    if (isNaN(limitParam) || isNaN(limitParam)) return [null, 0]
    return [limitParam, limitParam * pageParam]
}

function generatePublicKey(length) {
    let result = '';
    let characters = '0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function generatePrivateKey(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports = { computePageParams, generatePublicKey, generatePrivateKey }