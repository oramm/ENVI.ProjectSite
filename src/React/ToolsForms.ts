export default class ToolsDate {
    static getSuggestedClass(field: string, watchAllFields: any, initValue: any): string {
        return watchAllFields[field] === initValue ? 'text-primary' : '';
    }
}
