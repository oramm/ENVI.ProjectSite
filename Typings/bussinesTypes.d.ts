import { number } from "yup";

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
    alias: string;
    comment: string;
    startDate: string;
    endDate: string;
    _project: Project;
    status: string;
    gdFolderId: string;
    meetingProtocolsGdFolderId: string;
    _type: ContractType;
    value: number;
    _folderName: string;
    _gdFolderUrl: string;
    _ourIdOrNumber_Alias: string;
    _ourIdOrNumber_Name: string;
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

export interface Milestone extends RepositoryDataItem {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    gdFolderId: string;
    _parent: Contract;
    _FolderNumber_TypeName_Name: string;
    _folderName: string;
    _gdFolderUrl: string;
}

export interface CaseType extends RepositoryDataItem {
    name: string;
    folderNumber: string;
    isDefault: boolean;
    milestoneTypeId: number;
};

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


export interface ContractType extends RepositoryDataItem {
    name: string;
    description: string;
    isOur: boolean;
}

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
    description: string;
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