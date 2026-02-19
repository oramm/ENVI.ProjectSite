"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiMetaInfo = AiMetaInfo;
const react_1 = __importDefault(require("react"));
function AiMetaInfo({ _model, _usage }) {
    if (!_model && !_usage)
        return null;
    return (react_1.default.createElement("div", { className: "text-muted small mt-2" },
        _model && (react_1.default.createElement("span", { className: "me-3" },
            "Model: ",
            react_1.default.createElement("strong", null, _model))),
        _usage && (react_1.default.createElement("span", null,
            "Tokeny: ",
            _usage.promptTokens,
            " prompt +",
            " ",
            _usage.completionTokens,
            " odpowied\u017A =",
            " ",
            react_1.default.createElement("strong", null, _usage.totalTokens)))));
}
