
export const computePageParams = function (page, limit) {
    let limitParam = parseInt(limit, 10)
    let pageParam = parseInt(page, 10)
    if (isNaN(limitParam) || isNaN(limitParam)) return [null, 0]
    return [limitParam, limitParam * pageParam]
}

export const generateRandomString = function (len) {
    return Math.random().toString(36).substring(2, len + 2);
}
