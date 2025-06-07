export default class ToolsForms {
    static getSuggestedClass(field: string, watchAllFields: any, initValue: any): string {
        return watchAllFields[field] === initValue ? 'text-primary' : '';
    }
}
