"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ToolsForms {
    static getSuggestedClass(field, watchAllFields, initValue) {
        return watchAllFields[field] === initValue ? 'text-primary' : '';
    }
}
exports.default = ToolsForms;
