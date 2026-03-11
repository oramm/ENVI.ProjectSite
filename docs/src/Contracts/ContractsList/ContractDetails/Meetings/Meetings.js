"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Meetings;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const CommonComponents_1 = require("../../../../View/Resultsets/CommonComponents");
const FilterableTable_1 = __importDefault(require("../../../../View/Resultsets/FilterableTable/FilterableTable"));
const ContractDetailsContext_1 = require("../ContractDetailsContext");
const ContractsController_1 = require("../../ContractsController");
const MeetingModalButtons_1 = require("./Modals/MeetingModalButtons");
const MeetingAgendaPanel_1 = __importDefault(require("./MeetingAgendaPanel"));
const MeetingsFilterBody_1 = require("./MeetingsFilterBody");
function Meetings() {
    const { contract } = (0, ContractDetailsContext_1.useContractDetails)();
    const [meetings, setMeetings] = (0, react_1.useState)(undefined);
    const [selectedMeeting, setSelectedMeeting] = (0, react_1.useState)(undefined);
    (0, react_1.useEffect)(() => {
        let isMounted = true;
        async function fetchMeetings() {
            if (!contract?.id)
                return;
            try {
                await ContractsController_1.meetingsRepository.loadItemsFromServerPOST([{ contractId: contract.id }]);
                if (!isMounted)
                    return;
                setMeetings([...ContractsController_1.meetingsRepository.items]);
            }
            catch (error) {
                if (!isMounted)
                    return;
                console.error("Meetings: unable to load meetings", error);
                setMeetings([]);
            }
        }
        fetchMeetings();
        return () => {
            isMounted = false;
        };
    }, [contract?.id]);
    function handleRowClick(meeting) {
        setSelectedMeeting(selectedMeeting?.id === meeting.id ? undefined : meeting);
    }
    if (!contract) {
        return (react_1.default.createElement("div", null,
            "\u0141aduj\u0119 dane... ",
            react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null)));
    }
    return (react_1.default.createElement(react_bootstrap_1.Card, { className: "shadow-sm border-0" },
        react_1.default.createElement(react_bootstrap_1.Card.Body, { className: "p-3 p-xl-4" }, meetings ? (react_1.default.createElement(react_bootstrap_1.Row, { className: "g-3 align-items-stretch" },
            react_1.default.createElement(react_bootstrap_1.Col, { lg: 4, className: "d-flex" },
                react_1.default.createElement(react_bootstrap_1.Card, { className: "w-100 h-100 shadow-sm border bg-white" },
                    react_1.default.createElement(react_bootstrap_1.Card.Body, { className: "p-0" },
                        react_1.default.createElement(FilterableTable_1.default, { id: "meetings", title: "Spotkania", initialObjects: meetings, repository: ContractsController_1.meetingsRepository, AddNewButtonComponents: [MeetingModalButtons_1.MeetingAddNewModalButton], EditButtonComponent: MeetingModalButtons_1.MeetingEditModalButton, FilterBodyComponent: MeetingsFilterBody_1.MeetingsFilterBody, isDeletable: true, showTableHeader: false, tableStructure: [
                                { header: "Nazwa", objectAttributeToShow: "name" },
                                { header: "Data", objectAttributeToShow: "date" },
                            ], onRowClick: handleRowClick, externalUpdate: meetings.length })))),
            react_1.default.createElement(react_bootstrap_1.Col, { lg: 8, className: "d-flex" }, selectedMeeting ? (react_1.default.createElement("div", { className: "w-100" },
                react_1.default.createElement(MeetingAgendaPanel_1.default, { meeting: selectedMeeting }))) : (react_1.default.createElement(react_bootstrap_1.Card, { className: "w-100 shadow-sm border bg-light-subtle" },
                react_1.default.createElement(react_bootstrap_1.Card.Body, { className: "d-flex flex-column justify-content-center align-items-center text-center text-muted px-4", style: { minHeight: "420px" } },
                    react_1.default.createElement("div", { className: "text-uppercase small fw-semibold letter-spacing-1 mb-2" }, "Szczeg\u00F3\u0142y spotkania"),
                    react_1.default.createElement("h5", { className: "fw-normal mb-2" }, "Wybierz spotkanie z listy po lewej"),
                    react_1.default.createElement("p", { className: "mb-0" }, "Po wybraniu zobaczysz agend\u0119, statusy punkt\u00F3w i powi\u0105zan\u0105 notatk\u0119."))))))) : (react_1.default.createElement(react_1.default.Fragment, null,
            "\u0141adowanie spotka\u0144... ",
            react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null))))));
}
