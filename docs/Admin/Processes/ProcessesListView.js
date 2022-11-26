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
var ProcessesListView = /** @class */ (function (_super) {
    __extends(ProcessesListView, _super);
    function ProcessesListView() {
        return _super.call(this) || this;
    }
    ProcessesListView.prototype.initialise = function () {
        this.setTittle("Procesy");
        $("#title").after(new ProcessesCollapsible('processesCollapsible').$dom);
        this.dataLoaded(true);
    };
    return ProcessesListView;
}(Popup));
