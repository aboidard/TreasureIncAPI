
function computePageParams(page, limit) {
    let limitParam = parseInt(limit, 10)
    let pageParam = parseInt(page, 10)
    if (isNaN(limitParam) || isNaN(limitParam)) return [null, 0]
    return [limitParam, limitParam * pageParam]
}


module.exports = computePageParams