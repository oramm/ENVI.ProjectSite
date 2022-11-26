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
var ProjectDetailsView = /** @class */ (function (_super) {
    __extends(ProjectDetailsView, _super);
    function ProjectDetailsView() {
        return _super.call(this) || this;
    }
    ProjectDetailsView.prototype.initialise = function () {
        this.setTittle("Informacje o projekcie");
        this.projectDetailsCollection = new ProjectDetailsCollection('projectDetailsCollection');
        $('#projectDetails').append(this.projectDetailsCollection.$dom);
        $("#processes").append(new ProcessesCollapsible('processCollapsible').$dom);
        this.actionsMenuInitialise();
        this.dataLoaded(true);
    };
    ProjectDetailsView.prototype.actionsMenuInitialise = function () {
    };
    return ProjectDetailsView;
}(Popup));
