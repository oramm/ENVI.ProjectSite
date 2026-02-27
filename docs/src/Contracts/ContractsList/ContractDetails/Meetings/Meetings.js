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
                console.error('Meetings: unable to load meetings', error);
                setMeetings([]);
            }
        }
        fetchMeetings();
        return () => { isMounted = false; };
    }, [contract?.id]);
    function handleRowClick(meeting) {
        setSelectedMeeting(selectedMeeting?.id === meeting.id ? undefined : meeting);
    }
    if (!contract) {
        return react_1.default.createElement("div", null,
            "\u0141aduj\u0119 dane... ",
            react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null));
    }
    return (react_1.default.createElement(react_bootstrap_1.Card, null,
        react_1.default.createElement(react_bootstrap_1.Card.Body, null, meetings ? (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(FilterableTable_1.default, { id: "meetings", title: "Spotkania", initialObjects: meetings, repository: ContractsController_1.meetingsRepository, AddNewButtonComponents: [MeetingModalButtons_1.MeetingAddNewModalButton], EditButtonComponent: MeetingModalButtons_1.MeetingEditModalButton, FilterBodyComponent: MeetingsFilterBody_1.MeetingsFilterBody, isDeletable: true, showTableHeader: false, tableStructure: [
                    { header: 'Nazwa', objectAttributeToShow: 'name' },
                    { header: 'Data', objectAttributeToShow: 'date' },
                    { header: 'Lokalizacja', objectAttributeToShow: 'location' },
                ], onRowClick: handleRowClick, externalUpdate: meetings.length }),
            selectedMeeting && (react_1.default.createElement(MeetingAgendaPanel_1.default, { meeting: selectedMeeting })))) : (react_1.default.createElement(react_1.default.Fragment, null,
            "\u0141adowanie spotka\u0144... ",
            react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null))))));
}
