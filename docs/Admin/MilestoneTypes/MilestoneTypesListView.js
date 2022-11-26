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
var MilestoneTypesListView = /** @class */ (function (_super) {
    __extends(MilestoneTypesListView, _super);
    function MilestoneTypesListView() {
        return _super.call(this) || this;
    }
    MilestoneTypesListView.prototype.initialise = function () {
        this.setTittle("Typy kamieni milowych");
        $("#title").after(new MilestoneTypesCollapsible('molestoneTypesCollapsible').$dom);
        this.dataLoaded(true);
    };
    return MilestoneTypesListView;
}(Popup));
