import { number } from "yup";
import MainSetup from "../src/React/MainSetupReact";

export type SystemRoleName = 'ADMIN' | 'ENVI_MANAGER' | 'ENVI_EMPLOYEE' | 'ENVI_COOPERATOR' | 'EXTERNAL_USER';

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

export interface RepositoryDataItem {
    id: number;
    [key: string]: any;
};

export interface Project extends RepositoryDataItem {
    name: string;
    alias: string;
    comment: string;
    ourId: string;
    status: string;
    dotationValue: number;
    lettersGdFolderId: string;
    startDate: string;
    endDate: string;
    gdFolderId: string;
    _gdFolderUrl: string;
    _ourId_Alias: string;
}

export interface Contract extends RepositoryDataItem {
    name: string;
    number: string;
    alias: string;
    comment: string;
    startDate: string;
    endDate: string;
    guaranteeEndDate: string;
    _parent: Project;
    status: string;
    gdFolderId: string;
    meetingProtocolsGdFolderId: string;
    _type: ContractType;
    value: number;
    _remainingValue: number;
    _folderName: string;
    _gdFolderUrl: string;
    _ourIdOrNumber_Alias: string;
    _ourIdOrNumber_Name: string;
    _lastUpdated: string;
    _contractors?: Entity[];
    _engineers?: Entity[];
    _employers?: Entity[];
}

export interface OurContract extends Contract {
    _admin: Person;
    _manager: Person;
    ourId: string;

}

export interface OtherContract extends Contract {
    _contractors: Entity[];
    _ourContract: OurContract;
}

export interface ContractsSettlementData {
    id: number,
    ourId: string,
    value: number,
    totalIssuedValue: number,
    remainingValue: number
}

export interface Milestone extends RepositoryDataItem {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    gdFolderId: string;
    _type: MilestoneType;
    _parent: OurContract | OtherContract;
    _FolderNumber_TypeName_Name: string;
    _folderName: string;
    _gdFolderUrl: string;
}

export interface Case extends RepositoryDataItem {
    name: string;
    number: number;
    description: string;
    gdFolderId: string;
    _parent: Milestone;
    _type: CaseType;
    _folderName: string;
    _displayNumber: string;
    _gdFolderUrl: string;
    _typeFolderNumber_TypeName_Number_Name: string;
}

export interface Task extends RepositoryDataItem {
    name: string;
    description: string;
    deadline: string;
    _parent: Case;
    _editor: Person;
    _lastUpdated: string;
}

export interface ContractType extends RepositoryDataItem {
    name: string;
    description: string;
    isOur: boolean;
    status: string;
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
    folderNumber: string;
    _folderName: string;
    isDefault: boolean;
    isUniquePerMilestone: boolean;
    _milestoneType: MilestoneType;
    isDefault: boolean;
};


export interface Letter extends RepositoryDataItem {
    number: string;
    description: string;
    creationDate: string;
    registrationDate: string;
    _project: Project;
    _entitiesMain: Entity[];
    _entitiesCc: Entity[];
    _editor: Person;
    _lastUpdated: string;
    _cases: Case[];
    _gdFolderUrl?: string;
    letterFilesCount: number;
}

export interface OurLetter extends Letter {
    isOur: true;
    _documentOpenUrl?: string;
}

export interface IncomingLetter extends Letter {
    isOur: false;

}

export interface Entity extends RepositoryDataItem {
    name: string;
    address: string;
    description: string;
    taxNumber?: string;
}

export interface Person extends RepositoryDataItem {
    name: string;
    surname: string;
    email: string;
    cellPhone: string;
    _alias: string;
    position: string;
    _entity: Entity;
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
    number: string;
    description: string;
    issueDate: string;
    sentDate: string;
    paymentDeadline: string;
    daysToPay: number;
    status: string;
    gdId: string;
    _contract: OurContract;
    _editor: Person;
    _owner: Person;
    _entity: Entity;
    _lastUpdated: string;
    _documentOpenUrl?: string;
    _totalGrossValue: number;
    _totalNetValue?: number;
}

export interface InvoiceItem extends RepositoryDataItem {
    description: string;
    quantity: number;
    unitPrice: number;
    vatTax: number;
    _parent: Invoice;
    _editor: Person;
    _lastUpdated: string;
    _grossValue: number;
    _netValue: number;
    _vatValue: number;
}

export interface Security extends RepositoryDataItem {
    description: string,
    value: number,
    returnedValue: number,
    _remainingValue: number,
    deductionValue: number,
    firstPartRate: number,
    secondPartRate: number,
    firstPartExpiryDate: string,
    secondPartExpiryDate: string,
    isCash: boolean;
    gdFolderId: string;
    _contract: OurContract;
    _lastUpdated: string;
    _editor: Person;
}