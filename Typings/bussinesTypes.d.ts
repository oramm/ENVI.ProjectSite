import { number } from "yup";
import MainSetup from "../src/React/MainSetupReact";

export type SystemRoleName = "ADMIN" | "ENVI_MANAGER" | "ENVI_EMPLOYEE" | "ENVI_COOPERATOR" | "EXTERNAL_USER";

export type SystemRole = {
    id: number;
    systemName: SystemRoleName;
    description: string;
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

export interface ProjectData extends RepositoryDataItem {
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
    _project: ProjectData;
    projectOurId?: string;
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
    _contractRangesPerContract?: any[];
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

export interface MilestoneData extends RepositoryDataItem {
    name: string;
    number?: number;
    description?: string;
    status?: string;
    _dates: MilestoneDateData[];
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

export interface MilestoneDateData {
    id: number;
    milestoneId: number;
    startDate: string;
    endDate: string;
    description?: string | null;
    _milestone?: MilestoneData;
    lastUpdated: string;
}

export interface Case extends RepositoryDataItem {
    name?: string | null;
    number?: number;
    description?: string;
    gdFolderId?: string;
    parentCaseId?: number;
    _parent: MilestoneData;
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
    description?: string;
    deadline?: string | Date | null;
    _parent: Case;
    _lastUpdated?: string;
    status: string;
    ownerId?: number | null;
    _owner?: PersonData;
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
    isSubCaseOnly?: boolean;
    allowsSubCases?: boolean;
    _allowedSubCaseTypeIds?: number[];
    _milestoneType: MilestoneType;
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
    status: string;
    _lastEvent?: LetterEvent | null;
    relatedLetterNumber?: string;
    responseDueDate?: string;
    responseIKNumber?: string;
}

export interface OurLetter extends Letter {
    _template?: DocumentTemplate;
    isOur: true;
}

export interface IncomingLetter extends Letter {
    isOur: false;
}

export interface OurLetterContract extends OurLetter {
    _project: ProjectData;
    projectId?: number;
}

export interface IncomingLetterContract extends IncomingLetter {
    _project: ProjectData;
    projectId?: number;
}

export interface OurLetterOffer extends OurLetter {
    _offer: OurOffer;
}

export interface IncomingLetterOffer extends IncomingLetter {
    _offer: ExternalOffer;
}

export interface LetterEvent extends RepositoryDataItem {
    letterId?: number;
    editorId?: number;
    _editor: PersonData;
    eventType: string;
    _lastUpdated?: string;
    comment?: string | null;
    additionalMessage?: string | null;
    versionNumber?: number | null;
    _recipients?: PersonData[] | null;
    recipientsJSON?: string | null;
    _gdFilesBasicData?: drive_v3.Schema$File[];
    gdFilesJSON?: string | null;
}

export interface EntityData extends RepositoryDataItem {
    name?: string;
    shortName?: string;
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
    _skillNames?: string;
}

export interface SystemUserData extends RepositoryDataItem {
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
    systemRoleId: string;
    systemEmail: string;
}

export interface PersonAccountV2Payload {
    personId: number;
    systemRoleId?: number;
    systemEmail?: string;
    googleId?: string;
    googleRefreshToken?: string;
    microsoftId?: string;
    microsoftRefreshToken?: string;
    isActive?: boolean;
}

export interface PersonProfileV2Payload {
    personId: number;
    headline?: string;
    summary?: string;
    profileIsVisible?: boolean;
}

export interface PersonProfileV2Record extends PersonProfileV2Payload {
    id: number;
}

export interface PersonProfileExperienceV2Payload {
    organizationName?: string;
    positionName?: string;
    description?: string;
    dateFrom?: string;
    dateTo?: string;
    isCurrent?: boolean;
    sortOrder?: number;
}

export interface ExperienceSearchParams {
    searchText?: string;
    organizationName?: string;
    positionName?: string;
    isCurrent?: boolean;
    dateFromAfter?: string;
    dateFromBefore?: string;
    dateToAfter?: string;
    dateToBefore?: string;
}

export interface PersonProfileExperienceV2Record extends PersonProfileExperienceV2Payload {
    id: number;
    personProfileId: number;
}

export interface PersonProfileEducationV2Payload {
    schoolName?: string;
    degreeName?: string;
    fieldOfStudy?: string;
    dateFrom?: string;
    dateTo?: string;
    sortOrder?: number;
}

export interface EducationSearchParams {
    searchText?: string;
    schoolName?: string;
    degreeName?: string;
    fieldOfStudy?: string;
    dateFromAfter?: string;
    dateFromBefore?: string;
    dateToAfter?: string;
    dateToBefore?: string;
}

export interface PersonProfileEducationV2Record extends PersonProfileEducationV2Payload {
    id: number;
    personProfileId: number;
}

export interface SkillDictionaryRecord {
    id: number;
    name: string;
    nameNormalized: string;
    description?: string | null;
}

export interface PersonProfileSkillV2Record {
    id: number;
    personProfileId: number;
    skillId: number;
    levelCode?: string;
    yearsOfExperience?: number;
    sortOrder?: number;
    _skill?: SkillDictionaryRecord;
}

export interface ProfileSkillSearchParams {
    searchText?: string;
    skillId?: number;
    skillIds?: number[];
    levelCode?: string;
    minYearsOfExperience?: number;
}

// --- AI Profile Import types ---

export interface AiProfileExperience {
    _tempId: number;
    organizationName?: string;
    positionName?: string;
    description?: string;
    dateFrom?: string;
    dateTo?: string;
    isCurrent?: boolean;
}

export interface AiProfileEducation {
    _tempId: number;
    schoolName?: string;
    degreeName?: string;
    fieldOfStudy?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface AiProfileSkill {
    _tempId: number;
    name: string;
    levelCode?: string;
    yearsOfExperience?: number;
}

type AiUsageInfo = { promptTokens: number; completionTokens: number; totalTokens: number };

export interface AiPersonProfileResult {
    experiences: AiProfileExperience[];
    educations: AiProfileEducation[];
    skills: AiProfileSkill[];
    _extractedText?: string;
    _model?: string;
    _usage?: AiUsageInfo;
}

export interface ImportConfirmResponse {
    added: unknown[];
    skipped: unknown[];
    warnings?: string[];
    newDictionaryEntries?: unknown[];
}

// --- End AI Profile Import types ---

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

export interface InvoiceThirdParty {
    entityId?: number | null;
    role?: number | null;
    _entity?: EntityData;
}

export interface Invoice extends RepositoryDataItem {
    number?: string | null;
    description?: string;
    issueDate: string;
    sentDate?: string | null;
    paymentDeadline?: string | null;
    daysToPay: number;
    status: string;
    // Rodzaj dokumentu (np. 'correction')
    invoiceType?: string | null;
    // Flaga pomocnicza dla korekt
    isCorrection?: boolean | null;
    // Numer KSeF faktury źródłowej dla korekty
    originalKsefNumber?: string | null;
    // Nowe pola korekty z backendu
    correctedInvoiceId?: number | null; // ID faktury korygowanej (jeśli ta jest korektą)
    correctionReason?: string | null; // Przyczyna korekty
    _correctedInvoice?: Invoice | null; // Faktura korygowana (join)
    _corrections?: Invoice[]; // Lista korekt tej faktury
    gdId?: string | null;
    _contract: OurContract;
    _editor: PersonData;
    _owner: PersonData;
    _entity: EntityData;
    _lastUpdated?: string;
    _documentOpenUrl?: string;
    _totalGrossValue?: number;
    _totalNetValue?: number;
    // Pola KSeF
    ksefCorrectionType?: 1 | 2 | 3 | null;
    ksefNumber?: string | null;
    ksefStatus?: string | null;
    ksefSessionId?: string | null;
    ksefUpo?: string | null;
    isJstSubordinate?: boolean;
    isGvMember?: boolean;
    includeThirdParty?: boolean;
    thirdPartyEntityId?: number | null;
    _thirdParty?: EntityData;
    _thirdParties?: InvoiceThirdParty[];
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
    _invitationMail?: OfferInvitationMailToProcessData;
    invitationMailId?: number | null;
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

export interface OfferInvitationMailToProcessData extends MailData {
    status: string;
    _ourOfferId?: number;
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

export interface ContractRoleData extends RepositoryDataItem {
    id: number;
    personId: number | null;
    _person?: PersonData;
    name: string;
    description: string;
    groupName: string;
    contractId?: number | null;
    _contract?: OurContract | OtherContract;
}

export interface ProjectRoleData extends ContractRoleData {
    projectOurId?: string | null;
    _project?: ProjectData;
}

export interface ContractMeetingNoteData extends RepositoryDataItem {
    contractId: number;
    sequenceNumber: number;
    title: string;
    gdDocumentId?: string;
    _documentOpenUrl?: string;
    _documentEditUrl?: string;
    meetingDate?: string;
    createdAt?: string;
    createdByPersonId?: number;
    meetingId?: number | null;
}

export interface MeetingData extends RepositoryDataItem {
    name: string;
    description?: string;
    date?: string;
    location?: string;
    contractId?: number;
    protocolGdId?: string;
    _documentEditUrl?: string;
    _contract?: {
        id?: number;
        number?: string;
        name?: string;
    };
}

export type MeetingArrangementStatus = 'PLANNED' | 'DISCUSSED' | 'CLOSED';

export interface MeetingArrangementData extends RepositoryDataItem {
    name?: string;
    description?: string;
    deadline?: string | null;
    status: MeetingArrangementStatus;
    meetingId?: number;
    caseId?: number;
    _owner?: {
        id?: number;
        name?: string;
        surname?: string;
        email?: string;
    };
    _case?: {
        id?: number;
        name?: string;
        _type?: {
            id?: number;
            name?: string;
            folderNumber?: string;
        };
        _parent?: {
            id?: number;
            name?: string;
        };
    };
}

/**
 * Faktura kosztowa (zakupowa) - pobierana z KSeF
 * Faktury VAT przychodzące od kontrahentów
 */
export interface CostInvoice extends RepositoryDataItem {
    // Podstawowe dane faktury
    ksefNumber: string;
    invoiceNumber: string;
    invoiceType?: string | null;
    issueDate: string;
    saleDate?: string | null;
    dueDate?: string | null;

    // Dane kontrahenta (dostawcy)
    supplierNip: string;
    supplierName: string;
    supplierAddress?: string | null;
    supplierBankAccount?: string | null;
    paymentMethod?: string | null;
    paymentDate?: string | null;

    // Dane finansowe
    netAmount: number;
    vatAmount: number;
    grossAmount: number;
    currency: string;

    // Status faktury: "NEW" | "EXCLUDED" | "BOOKED"
    status: "NEW" | "EXCLUDED" | "BOOKED";

    // Status płatności
    paymentStatus?: "UNPAID" | "PARTIALLY_PAID" | "PAID" | "NOT_APPLICABLE";
    paidAmount?: number;

    // Ustawienia księgowania
    /** Procent kwoty netto do zaksięgowania (0-100) */
    bookingPercentage: number;
    /** Procent VAT do odliczenia (0-100) */
    vatDeductionPercentage: number;
    /** Wyliczona kwota netto do zaksięgowania */
    bookableNetAmount?: number;
    /** Wyliczona kwota VAT do odliczenia */
    deductibleVatAmount?: number;

    // Kategoria kosztu
    categoryId?: number | null;
    _category?: CostInvoiceCategory | null;

    // Pozycje faktury
    _items?: CostInvoiceItem[];

    // Notatki
    notes?: string | null;

    // Info o zaksięgowaniu
    bookedBy?: number | null;
    bookedAt?: string | null;
    _bookedByPerson?: PersonData | null;

    // Metadane
    createdAt?: string;
    _lastUpdated?: string;
    _editor?: PersonData;
}

/**
 * Kategoria kosztu
 */
export interface CostInvoiceCategory {
    id: number;
    name: string;
    color: string;
    /** Domyślny % odliczenia VAT dla tej kategorii */
    vatDeductionDefault: number;
}

/**
 * Pozycja faktury kosztowej
 */
export interface CostInvoiceItem {
    id: number;
    lineNumber: number;
    description: string;
    quantity: number;
    unit?: string | null;
    unitPrice: number;
    netValue: number;
    vatRate: number;
    vatValue: number;
    grossValue: number;
    /** Czy pozycja wybrana do księgowania */
    isSelectedForBooking: boolean;
    /** Procent kwoty netto do zaksięgowania (0-100) */
    bookingPercentage: number;
    /** Procent VAT do odliczenia (0-100) */
    vatDeductionPercentage: number;
    /** Kategoria pozycji (opcjonalna, nadpisuje kategorię faktury) */
    categoryId?: number | null;
    _category?: CostInvoiceCategory | null;
}

/**
 * Odpowiedź synchronizacji z KSeF
 */
export interface CostInvoiceSyncResponse {
    success: boolean;
    message: string;
    data: {
        imported: number;
        alreadyAdded: number;
        failedCount: number;
        errorDetails: string[];
    };
}

/**
 * Raport miesięczny faktur kosztowych
 */
export interface CostInvoiceMonthlyReport {
    summary: {
        year: number;
        month: number;
        totalInvoices: number;
        totalNet: number;
        totalVat: number;
        totalGross: number;
        bookableNet: number;
        deductibleVat: number;
        byCategory: Record<string, { count: number; net: number; vat: number }>;
        byStatus: Record<string, number>;
    };
    invoices: CostInvoice[];
}
