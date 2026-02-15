"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOurContract = isOurContract;
exports.isOtherContract = isOtherContract;
function isOurContract(x) {
    return !!x?._type?.isOur;
}
function isOtherContract(x) {
    return x?._type?.isOur === false;
}
