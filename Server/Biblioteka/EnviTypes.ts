interface _blobEnviObject {
    blobBase64String: string; //base64data,
    name: string; //blob.name,
    mimeType: string; //blob.mimeType
}

namespace Envi {
    export interface DocumentTemplate {
        id: number,
        gdId: string,
        caseTypeId: number,
        contents: string,
        name?: string
        description?: string
    }

    export interface Document {
        id?: any;
        isOur: boolean;
        number?: string | number;
        description?: string;
        creationDate?: string;
        registrationDate?: string;
        _documentOpenUrl?: string;
        documentGdId: string;
        _gdFolderUrl?: string;
        folderGdId?: string;
        _lastUpdated?: string;
        _contract?: any;
        _project?: any;
        projectId?: any;
        _cases?: any[];
        _entitiesMain?: any[];
        _entitiesCc?: any[];
        letterFilesCount?: number;
        _editor?: any;
        _fileOrFolderChanged?: boolean;

        editorId?: number;
        _canUserChangeFileOrFolder?: boolean;
        _folderName?: string;
        _documentEditUrl?: string;
    }
}