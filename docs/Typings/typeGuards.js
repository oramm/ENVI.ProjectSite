"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOtherContract = exports.isOurContract = void 0;
function isOurContract(x) {
    return !!x?._type?.isOur;
}
exports.isOurContract = isOurContract;
function isOtherContract(x) {
    return x?._type?.isOur === false;
}
exports.isOtherContract = isOtherContract;
