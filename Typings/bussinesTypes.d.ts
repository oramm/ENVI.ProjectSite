import { number } from "yup";
import MainSetup from "../src/React/MainSetupReact";

export type SystemRoleName = "ADMIN" | "ENVI_MANAGER" | "ENVI_EMPLOYEE" | "ENVI_COOPERATOR" | "EXTERNAL_USER";

export type SystemRole = {
    id: number;
    systemName: SystemRoleName;
};

export interface User {
    googleId: string;
    picture: string;
    systemEmail: string;
    systemRoleId: number;
    systemRoleName: SystemRoleName;
    userName: string;
}

export interface ErrorServerResponse {
    errorMessage: string;
    status: number;
}

export interface RepositoryDataItem {
    id: number;
    _gdFolderUrl?: string;
    _documentOpenUrl?: string;
}

export interface Project extends RepositoryDataItem {
    ourId: string;
    name: string;
    alias: string;
    comment: string;
    ourId: string;
    status: string;
    lettersGdFolderId?: string;
    startDate?: string;
    endDate?: string;
    gdFolderId?: string;
    _gdFolderUrl?: string;
    _ourId_Alias: string;
    financialComment?: string;
    totalValue?: string | number;
    qualifiedValue?: string | number;
    dotationValue?: string | number;
    gdFolderId: string | undefined;
    _lastUpdated?: string;
    _engineers?: EntityData[];
    _employers?: EntityData[];
}

export interface Contract extends RepositoryDataItem {
    name: string;
    number: string;
    alias: string;
    comment: string;
    startDate?: string;
    endDate?: string;
    guaranteeEndDate?: string;
    _project: Project;
    status: string;
    gdFolderId?: string;
    meetingProtocolsGdFolderId?: string;
    _type: ContractType;
    value?: string | number;
    _remainingNotScheduledValue?: string | number;
    _remainingNotIssuedValue?: string | number;
    _folderName?: string;
    _gdFolderUrl?: string;
    _ourIdOrNumber_Alias?: string;
    _ourIdOrNumber_Name?: string;
    _lastUpdated?: string;
    _contractors?: EntityData[];
    _engineers?: EntityData[];
    _employers?: EntityData[];
    _contractRanges?: ContractRangeData[];
    _contractRangesNames?: string[];
}

export interface OurContract extends Contract {
    _admin?: PersonData;
    _manager?: PersonData;
    ourId: string;
    _ourType: string;
    _admin?: PersonData;
    _city?: CityData;
}

export interface OtherContract extends Contract {
    _contractors?: EntityData[];
    _ourContract?: OurContract;
    materialCardsGdFolderId?: string;
}

export interface ContractsSettlementData {
    id: number;
    ourId: string;
    value: number;
    totalIssuedValue: number;
    totalRegisteredValue: number;
    remainingRegisteredValue: number;
    remainingIssuedValue: number;
}

export interface ContractRangeData {
    id: number;
    name: string;
    description: string;
}

export interface Milestone extends RepositoryDataItem {
    name: string;
    number?: number;
    description?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    gdFolderId?: string;
    _type: MilestoneType;
    _contract?: OurContract | OtherContract;
    _offer?: OurOffer | ExternalOffer;
    contractId?: number;
    offerId?: number;
    _FolderNumber_TypeName_Name?: string;
    _folderNumber?: string;
    _folderName?: string;
    _gdFolderUrl?: string;
}

export interface Case extends RepositoryDataItem {
    name?: string | null;
    number?: number;
    description?: string;
    gdFolderId?: string;
    _parent: Milestone;
    _type: CaseType;
    _folderName?: string;
    _displayNumber?: string;
    _gdFolderUrl?: string;
    _typeFolderNumber_TypeName_Number_Name?: string;
    _risk?: any;
    _processesInstances?: any[];
}

export interface Task extends RepositoryDataItem {
    name: string;
    description: string;
    deadline: string;
    status: string;
    _parent: Case;
    _owner: PersonData;
    _editor: PersonData;
    _lastUpdated: string;
}

export interface ContractType extends RepositoryDataItem {
    name: string;
    description?: string;
    isOur: boolean;
    status?: string;
}

export interface MilestoneType extends RepositoryDataItem {
    name: string;
    description: string;
    isInScrumByDefault: boolean;
    isUniquePerContract: boolean;
    _isDefault: boolean;
    _contractType: ContractType;
    _folderNumber_MilestoneTypeName: string;
    _folderNumber: string;
}

export interface CaseType extends RepositoryDataItem {
    name: string;
    description: string;
    folderNumber: string;
    _folderName: string;
    isDefault: boolean;
    isUniquePerMilestone: boolean;
    _milestoneType: MilestoneType;
    isDefault: boolean;
}

export interface GenericDocument extends RepositoryDataItem {
    description?: string;
    creationDate?: string;
    _documentOpenUrl?: string;
    gdDocumentId?: string | null;
    _gdFolderUrl?: string;
    gdFolderId?: string | null;
    _lastUpdated?: string;
    _entitiesMain?: EntityData[];
    _entitiesCc?: EntityData[];
    letterFilesCount?: number;
    _editor?: PersonData;
    _fileOrFolderChanged?: boolean;
    editorId?: number;
    _canUserChangeFileOrFolder?: boolean;
    _documentEditUrl?: string;
}

export interface Letter extends GenericDocument {
    number?: string | number;
    registrationDate?: string;
    _editor: PersonData;
    _cases: Case[];
}

export interface OurLetter extends Letter {
    _template?: DocumentTemplate;
    isOur: true;
}

export interface IncomingLetter extends Letter {
    isOur: false;
}

export interface OurLetterContract extends OurLetter {
    _project: Project;
    projectId?: number;
}

export interface IncomingLetterContract extends IncomingLetter {
    _project: Project;
    projectId?: number;
}

export interface OurLetterOffer extends OurLetter {
    _offer: OurOffer;
}

export interface IncomingLetterOffer extends IncomingLetter {
    _offer: ExternalOffer;
}

export interface EntityData extends RepositoryDataItem {
    name?: string;
    address?: string;
    taxNumber?: string;
    www?: string;
    email?: string;
    phone?: string;
}

export interface PersonData extends RepositoryDataItem {
    name: string;
    surname: string;
    email: string;
    cellPhone: string;
    phone: string;
    comment: string;
    _alias: string;
    position: string;
    _entity: EntityData;
    _nameSurnameEmail: string;
}

export interface DocumentTemplate extends RepositoryDataItem {
    name: string;
    description: string;
    gdId: string;
    _contents: {
        id?: number;
        gdId?: string;
        alias: string;
        caseTypeId: number | null;
    };
    _nameContentsAlias?: string;
}

export interface Invoice extends RepositoryDataItem {
    number?: string | null;
    description?: string;
    issueDate: string;
    sentDate?: string | null;
    paymentDeadline?: string | null;
    daysToPay: number;
    status: string;
    gdId?: string | null;
    _contract: OurContract;
    _editor: PersonData;
    _owner: PersonData;
    _entity: EntityData;
    _lastUpdated?: string;
    _documentOpenUrl?: string;
    _totalGrossValue?: number;
    _totalNetValue?: number;
}

export interface InvoiceItem extends RepositoryDataItem {
    description: string;
    quantity: number;
    unitPrice: number;
    vatTax: number;
    _parent: Invoice;
    _editor: PersonData;
    _lastUpdated: string;
    _grossValue: number;
    _netValue: number;
    _vatValue: number;
}

export interface Security extends RepositoryDataItem {
    description: string;
    value: number;
    returnedValue: number;
    _remainingValue: number;
    deductionValue: number;
    firstPartRate: number;
    secondPartRate: number;
    firstPartExpiryDate: string;
    secondPartExpiryDate: string;
    isCash: boolean;
    status: string;
    gdFolderId: string;
    gdFolderUrl?: string;
    _contract: OurContract;
    _lastUpdated: string;
    _editor: PersonData;
}

export interface CityData extends RepositoryDataItem {
    name: string;
    code: string;
}

interface Offer extends RepositoryDataItem {
    creationDate?: string;
    alias: string;
    description?: string;
    comment?: string;
    emailAdditionalContent?: string;
    submissionDeadline?: string;
    _type: ContractType;
    _city: CityData;
    typeId?: number;
    cityId?: number;
    form: string;
    isOur: boolean;
    bidProcedure: string;
    employerName?: string;
    _employer?: EntityData;
    status?: string;
    gdFolderId?: string;
    _gdFolderUrl?: string;
    _lastEvent?: OfferEventData | null;
}

export interface OurOffer extends Offer {
    gdDocumentId?: string;
    resourcesGdFolderId?: string;
}

export interface ExternalOffer extends Offer {
    tenderUrl?: string;
    _offerBond?: OfferBondData | null;
}

export interface OfferBondData extends RepositoryDataItem {
    _offer?: OfferData;
    value: number;
    form: string;
    paymentData: string;
    comment?: string | null;
    status: string;
    expiryDate?: string | null;
}

export interface MailData extends RepositoryDataItem {
    uid: number;
    subject: string;
    body?: string;
    from: string;
    to: string;
    date: string;
    flags?: Set<string>;
    _ourOfferId?: number;
    _lastUpdated?: string;
    editorId?: number | null;
    _editor?: PersonData;
}

export interface MailDataToProcess extends MailData {
    status: string;
    _ourOffer?: OurOfferData;
}

export interface OfferEventData extends RepositoryDataItem {
    offerId?: number;
    editorId?: number;
    _editor: PersonData;
    eventType: string;
    _lastUpdated?: string;
    comment?: string | null;
    additionalMessage?: string | null;
    versionNumber?: number | null;
    _recipients?: PersonData[];
    _gdFilesBasicData?: drive_v3.Schema$File[];
    gdFilesJSON?: string | null;
}

export interface FinancialAidProgrammeData extends RepositoryDataItem {
    name: string;
    alias: string;
    description: string;
    url: string;
    gdFolderId: string;
    _gdFolderUrl?: string;
}

export interface FocusAreaData extends RepositoryDataItem {
    financialAidProgrammeId?: number;
    _financialAidProgramme: FinancialAidProgrammeData;
    name: string;
    alias: string;
    description: string;
    gdFolderId: string;
    _gdFolderUrl?: string;
}

export interface ApplicationCallData extends RepositoryDataItem {
    focusAreaId?: number;
    _focusArea: FocusAreaData;
    description: string;
    url: string;
    startDate: string | null;
    endDate: string | null;
    status: string;
    gdFolderId: string;
    _gdFolderUrl?: string;
}
export interface NeedData extends RepositoryDataItem {
    clientId?: number;
    _client: EntityData;
    name: string;
    description: string;
    status: string;
    applicationCallId?: number | null;
    _applicationCall?: ApplicationCallData | null;
    _focusAreas?: FocusAreaData[];
    _focusAreasNames?: string[] | undefined;
}

export interface NeedsFocusAreasData {
    needId?: number;
    focusAreaId?: number;
    _need: NeedData;
    _focusArea: FocusAreaData;
    comment: string;
}
