"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Section = void 0;
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const ResultSetTable_1 = require("./ResultSetTable");
function Section({ sectionNode, resulsetTableProps, }) {
    return (sectionNode.isInAccordion ?
        react_1.default.createElement(react_bootstrap_1.Accordion, { key: sectionNode.name, alwaysOpen: true, defaultActiveKey: ['0'] },
            react_1.default.createElement(react_bootstrap_1.Accordion.Item, { eventKey: "0" },
                react_1.default.createElement(react_bootstrap_1.Accordion.Header, null,
                    react_1.default.createElement(SectionHeader, { sectionNode: sectionNode })),
                react_1.default.createElement(react_bootstrap_1.Accordion.Body, null,
                    react_1.default.createElement(SectionBody, { resulsetTableProps: resulsetTableProps, sectionNode: sectionNode }))))
        :
            react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(SectionHeader, { sectionNode: sectionNode }),
                react_1.default.createElement(SectionBody, { resulsetTableProps: resulsetTableProps, sectionNode: sectionNode })));
}
exports.Section = Section;
function SectionHeader({ sectionNode }) {
    function makeTitleStyle(nodeLevel) {
        return {
            //marginTop: nodeLevel === 1 ? '35px' : undefined,
            fontSize: nodeLevel === 1 ? '1.5rem' : '1rem',
            fontWeight: 600 - nodeLevel * 100,
            color: `rgb(${50}, ${130}, ${50})`
        };
    }
    function handleClick() {
        console.log('handleClick', sectionNode.dataItem);
        sectionNode.repository.addToCurrentItems(sectionNode.dataItem.id);
    }
    return react_1.default.createElement("div", { onClick: handleClick, key: sectionNode.name, style: makeTitleStyle(sectionNode.level) }, sectionNode.titleLabel);
}
function SectionBody({ sectionNode, resulsetTableProps }) {
    return (react_1.default.createElement(react_1.default.Fragment, null,
        sectionNode.children.map((childNode, index) => react_1.default.createElement(Section, { key: childNode.dataItem.id + childNode.name, sectionNode: childNode, resulsetTableProps: resulsetTableProps })),
        sectionNode.leafs &&
            react_1.default.createElement(ResultSetTable_1.ResultSetTable, { ...resulsetTableProps, filteredObjects: sectionNode.leafs })));
}
