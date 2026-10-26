
export const generateRandomString = function (len) {
    return Math.random().toString(36).substring(2, len + 2);
}
