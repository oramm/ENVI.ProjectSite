"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var CaseTypesListView = /** @class */ (function (_super) {
    __extends(CaseTypesListView, _super);
    function CaseTypesListView() {
        return _super.call(this) || this;
    }
    CaseTypesListView.prototype.initialise = function () {
        this.setTittle("Lista typów spraw");
        this.actionsMenuInitialise();
        $('#actionsMenu').after(new CaseTypesCollapsible('caseTypesCollapsible').$dom);
        this.dataLoaded(true);
    };
    CaseTypesListView.prototype.actionsMenuInitialise = function () {
    };
    return CaseTypesListView;
}(Popup));
