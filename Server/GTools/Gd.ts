function Gd(contract) {
    if (contract) {
        if (typeof contract.addInDb !== 'function') throw new Error("Argument Gd musi być typu 'Contract'");
        this.contract = contract;
        this.projectFolder = Gd.setFolder(GD_ROOT_FOLDER, this.contract.projectId);
        //przy edycji mamy już ustalone gdFolderId
        if (this.contract.gdFolderId)
            this.contractFolder = DriveApp.getFolderById(this.contract.gdFolderId);
        else if (!this.contract.ourId) {
            var parentFolder = (this.contract._ourContract.id) ? DriveApp.getFolderById(this.contract._ourContract.gdFolderId) : this.projectFolder;
            this.contractFolder = Gd.setFolder(parentFolder, this.contract.number);
        }
        //podwójne sprawdzenie potrzebne, żeby używać tego z poziomu dodawania nowych projektów (bez kontraktów jeszcze)
        else if (this.contract.ourId)
            this.contractFolder = Gd.setFolder(this.projectFolder, this.contract.ourId);

    }
}
Gd.setFolder = function (root: GoogleAppsScript.Drive.Folder, name: string): GoogleAppsScript.Drive.Folder {
    name = name.trim();
    var folder: GoogleAppsScript.Drive.Folder;
    var existingFolders = root.getFoldersByName(name);
    if (!existingFolders.hasNext()) {
        folder = root.createFolder(name)
        folder.setShareableByEditors(true);
    }
    else
        folder = existingFolders.next();
    return folder;
}

Gd.createGdFolderUrl = function (gdFolderId: string): string {
    if (gdFolderId)
        return 'https://drive.google.com/drive/folders/' + gdFolderId;
}

Gd.createDocumentOpenUrl = function (gdDocumentId: string): string {
    if (gdDocumentId)
        return 'https://drive.google.com/open?id=' + gdDocumentId;
}

Gd.createDocumentEditUrl = function (gdDocumentId: string): string {
    if (gdDocumentId)
        return 'https://docs.google.com/document/d/' + gdDocumentId + '/edit';
}

Gd.createDuplicateFile = function (gdSourceFileId: string, destinationFolderId: string, fileName: string): GoogleAppsScript.Drive.File {
    var source = DriveApp.getFileById(gdSourceFileId);
    var targetFolder = DriveApp.getFolderById(destinationFolderId);
    var newFile = source.makeCopy(fileName, targetFolder);
    newFile.setShareableByEditors(true);
    return newFile;
}

Gd.canUserDeleteFile = function (fileGdId: string): boolean {
    if (!fileGdId) throw new Error('fileGdId musi być zdefiniowane');
    var userEmail = Session.getEffectiveUser().getEmail();
    console.log('userEmail: ' + userEmail + ', fileGdId: ' + fileGdId);
    var fileOwnerEmail;
    fileOwnerEmail = DriveApp.getFileById(fileGdId).getOwner().getEmail();
    return userEmail == fileOwnerEmail;
}

Gd.canUserDeleteFolder = function (folderGdId: string): boolean {
    if (!folderGdId) throw new Error('folderGdId musi być zdefiniowane');
    var userEmail: string = Session.getEffectiveUser().getEmail();
    console.log('userEmail: ' + userEmail + ', folderGdId: ' + folderGdId);
    var folderOwnerEmail: string = DriveApp.getFolderById(folderGdId).getOwner().getEmail();

    return userEmail == folderOwnerEmail;
}
/*
 * Odpina plik od wszystkich rodziców - plik zostaje sierotą
 */
Gd.removeAllFileParents = function (file: GoogleAppsScript.Drive.File): void {
    var parentFolders: GoogleAppsScript.Drive.FolderIterator = file.getParents();
    while (parentFolders.hasNext()) {
        var folder: GoogleAppsScript.Drive.Folder = parentFolders.next();
        folder.removeFile(file);
    }
}

/*
 * Odpina folder od wszystkich rodziców - folder zostaje sierotą
 */
Gd.removeAllFolderParents = function (folder: GoogleAppsScript.Drive.Folder): void {
    var parentFolders: GoogleAppsScript.Drive.FolderIterator = folder.getParents();
    while (parentFolders.hasNext()) {
        var folder: GoogleAppsScript.Drive.Folder = parentFolders.next();
        folder.removeFolder(folder);
    }
}
Gd.getIdFromUrl = function (url) {
    if (url) return url.match(/[-\w]{25,}$/)[0];
}

Gd.prototype = {
    constructor: Gd,

    createGdFolderUrl: function (gdFolderId: string): string {
        if (gdFolderId)
            return 'https://drive.google.com/drive/folders/' + gdFolderId;
    },

    /*
     * Służy do tworzenia domyślnych folderów przy dodawaniu kontraktu w addNewContract()
     */
    createContractFolders: function () {
        var foldersData = this.makeContractFoldersDataList();

        this.createFoldersTool(foldersData, this.contractFolder);
        return foldersData;
    },

    editContractFolder: function () {
        if (this.contractFolder.isTrashed()) throw new Error('Folder dla tego kontratu został usunięty!'); //folder.setTrashed(false); //aby to obsłużyć trzeba jeszcze poprawić folderId w bazie

        if (this.contract.ourId) {
            this.contractFolder.setName(this.contract.ourId);
        }
        else {
            this.contractFolder.setName(this.contract.number);
            //var destinationFolderId = this.contract_ourContract.contractFolder.getId();
            var destinationFolderId = (this.contract._ourContract.id) ? this.contract._ourContract.gdFolderId : this.projectFolder.getId();
            this.moveFolder(this.contractFolder.getId(), destinationFolderId);
        }
    },
    /*
     * Służy do tworzenia domyślnych folderów przy dodawaniu pojedynczego milesotna 
     */
    createMilestoneFolders: function (milestone) {
        var foldersData = this.makeContractFoldersDataList(milestone);

        if (!milestone._type.isUniquePerContract) {
            var sameTypeFoldersCount = this.getSubfoldersCount(this.contractFolder, milestone._type._folderNumber + '_') + 1;
            foldersData[0].name = milestone._type._folderNumber + '_' + sameTypeFoldersCount + ' ' + milestone._type.name + ' ' + milestone.name;
        }
        this.createFoldersTool(foldersData, this.contractFolder);
        return foldersData;
    },

    editMilestoneFolder: function (milestone) {
        //sytuacja normalna - folder istnieje
        if (milestone.gdFolderId) {
            var folder = DriveApp.getFolderById(milestone.gdFolderId);
            if (folder.isTrashed()) throw new Error('Folder dla tego kamienia został usunięty! \n jego Id: ' + milestone.gdFolderId); //folder.setTrashed(false); //aby to obsłużyć trzeba jeszcze poprawić folderId w bazie
            var name = milestone._type._folderNumber + ' ' + milestone._type.name + ' ' + milestone.name
            folder.setName(name.trim());
            return { gdFolderId: milestone.gdFolderId };
        }
        //kamień nie miał wcześniej typu albo coś poszło nie tak przy tworzeniu folderu
        else
            return this.createMilestoneFolders(milestone)[0];
    },

    deleteMilestoneFolder: function (milestone) {
        var folder = DriveApp.getFolderById(milestone.gdFolderId);
        folder.setTrashed(true);
    },
    /**
     * Tworzy folder sprawy. 
     * Jeżeli typ sprawy jest unikatowy nie powstaje jej podfolder -pliki są bezpośrednio w folderze typu sprawy w danym kamieniu milowym  
     */
    createCaseFolder: function (caseItem) {
        //znajdź (i jak trzeba utwórz) folder typu sprawy
        var milestoneFolder = DriveApp.getFolderById(caseItem._parent.gdFolderId);
        var parentFolder = Gd.setFolder(milestoneFolder, caseItem._type.folderNumber + ' ' + caseItem._type.name);
        var caseFolder;
        if (!caseItem._type.isUniquePerMilestone) {
            caseFolder = Gd.setFolder(parentFolder, 'SXX ' + caseItem.name)
        }
        else {
            //Logger.log('createCaseFolder: parent name: '+ caseItem._type.folderNumber + ' ' + caseItem._type.name)
            caseFolder = parentFolder
        }
        caseItem.setGdFolderId(caseFolder.getId());
        return caseFolder;
    },

    editCaseFolder: function (caseItem) {
        //sytuacja normalna - folder itnieje
        if (caseItem.gdFolderId) {
            //sprawy uniqe nie mają swojego foldera - nie ma czego edytować, chyba, że zostały zmienione na unique
            if (caseItem._wasChangedToUniquePerMilestone || !caseItem._type.isUniquePerMilestone) {
                var folder = DriveApp.getFolderById(caseItem.gdFolderId);
                if (folder.isTrashed()) throw new Error('Folder dla tego kamienia został usunięty!'); //folder.setTrashed(false); //aby to obsłużyć trzeba jeszcze poprawić folderId w bazie
                //var caseName = (caseItem.name)? ' ' + caseItem.name : '';
                folder.setName(caseItem._folderName);
                return folder;
            }
        }
        //kamień nie miał wcześniej typu albo coś poszło nie tak przy tworzeniu folderu
        else
            return this.createCaseFolder(caseItem)
    },

    deleteCaseFolder: function (caseItem) {
        //sprawy uniqe nie mają swojego foldera - nie ma czego kasować
        if (!caseItem._type.isUniquePerMilestone && caseItem.gdFolderId) {
            var folder = DriveApp.getFolderById(caseItem.gdFolderId);
            if (Gd.canUserDeleteFolder(caseItem.gdFolderId))
                folder.setTrashed(true);
            else
                folder.setName(folder.getName() + '- USUŃ');
        }
    },

    createFoldersTool: function (foldersData, parent) {
        var currentRootFolder = parent;
        var parentName;
        var createdFolders = [];
        for (var i = 0; i < foldersData.length; i++) {
            parentName = foldersData[i].parentName;
            //jest podfolder
            if (parentName) {
                //zmienił się parent w porównaniu do poprzednika
                if (foldersData[i - 1].parentName != parentName) {
                    currentRootFolder = this.searchFolderByName(foldersData[i].parentName, parent);
                }
            }
            //folder główny
            else
                currentRootFolder = parent;

            createdFolders.push(Gd.setFolder(currentRootFolder, foldersData[i].name));
            createdFolders[i].setDescription(foldersData[i].description || '');
            foldersData[i].gdFolderId = createdFolders[i].getId();
        }
        return createdFolders;
    },

    createIssueFolders: function (issue) {
        var rootFolder = Gd.setFolder(this.contractFolder, 'Zgłoszenia');//this.searchFolderByName('11 Odpowiedzialność za wady');
        var issueFolder = Gd.setFolder(rootFolder, issue.name);
        issueFolder.setDescription(issue.description);

        Gd.setFolder(issueFolder, '01 Zgłoszenie');
        Gd.setFolder(issueFolder, '02 Po zgłoszeniu');
        issue.gdFolderId = issueFolder.getId();
        issue._gdFolderUrl = this.createGdFolderUrl(issue.gdFolderId)
    },


    searchFolderByName: function (name, rootFolder) {
        var childFolders = (rootFolder) ? rootFolder.getFolders() : this.contractFolder.getFolders();
        var result;
        while (childFolders.hasNext()) {
            var child = childFolders.next();
            //Logger.log(child.getName());
            if (child.getName().indexOf(name > -1)) return child;
            result = this.getSubFolders(name, child);
            if (result) return result;
        }
    },

    getSubFolders: function (name, parent) {
        var childFolder = parent.getFolders();
        while (childFolder.hasNext()) {
            var child = childFolder.next();
            //Logger.log(child.getName());
            if (child.getName().trim() === name.trim()) return child;
            this.getSubFolders(child);
        }
        return;
    },

    //tworzy drzewo folderów kamieni/kamienia i typów spraw na podstawie db
    makeContractFoldersDataList: function (milestone) {
        var foldersData = [];
        var caseTypes = (!milestone) ? this.contract.getCaseTypes() : milestone.getCaseTypes();
        if (caseTypes.length === 0) {
            if (!milestone)
                throw new Error('Nie przypisano typu spraw dla tego kontraktu. Zgłoś się do administratora');
            else
                throw new Error('Nie przypisano typu spraw dla tego kamienia: ' + milestone.name + '. Zgłoś się do administratora');
        }
        var currentMilestoneFolderData: any = {},
            parentFolderData: any = {};
        var currentCaseFolderData = {};
        for (var i = 0; i < caseTypes.length; i++) {
            //jeżeli wywoływana do tworzenia  folderów dla domyślnych kamieni to warnek 1 jeżeli dla pojedynczego kamienia - warunek 2 
            if (caseTypes[i]._milestoneType._isDefault || milestone) {
                var milestoneName = (milestone) ? milestone.name : '';
                var name = caseTypes[i]._milestoneType._folderNumber + ' ' + caseTypes[i]._milestoneType.name + ' ' + milestoneName
                currentMilestoneFolderData = {
                    name: name.trim(),
                    description: caseTypes[i]._milestoneType.description,
                    _milestoneType: caseTypes[i]._milestoneType
                };
                if (currentMilestoneFolderData.name !== parentFolderData.name) {
                    parentFolderData = currentMilestoneFolderData;
                    foldersData.push(parentFolderData);
                    //Logger.log('Folder Kamienia: ' + parentFolderData.name)
                }

                currentCaseFolderData = {
                    name: caseTypes[i].folderNumber + ' ' + caseTypes[i].name,
                    parentName: caseTypes[i]._milestoneType._folderNumber + ' ' + caseTypes[i]._milestoneType.name,
                    description: caseTypes[i].description
                };
                foldersData.push(currentCaseFolderData);
                //Logger.log('\t Folder sprawy: ' + currentCaseFolderData.name + ' w ' + currentCaseFolderData.parentName);
            }
        }
        return foldersData;
    },

    getSubfoldersCount: function (folder, string) {
        var subfolders = folder.getFolders();
        var i = 0;
        while (subfolders.hasNext()) {
            var folder = subfolders.next();
            if (!string || folder.getName().indexOf(string) >= 0)
                i++;
        }
        return i;
    },
    /*
     * This script moves a specific folder into a given folder, and removes the folder
     * from all other folders that previously contained it. For more information on
     * interacting with files, see
     * https://developers.google.com/apps-script/drive/file
     */
    //var destinationFolderId = (this.contract._ourContract.id)? this.contract._ourContract.gdFolderId : this.projectFolder;
    //this.moveFolder(this.contractFolder.getId(), destinationFolderId);

    moveFolder: function (sourceFolderId, targetFolderId) {
        var sourceFolder = DriveApp.getFolderById(sourceFolderId);
        var targetFolder = DriveApp.getFolderById(targetFolderId);

        var currentParentFolders = sourceFolder.getParents();
        var sameParentFound;
        while (currentParentFolders.hasNext()) {
            var currentParentFolder = currentParentFolders.next();
            Logger.log('currentParentFolderId: %s || targetFolderId: %s', currentParentFolder.getId(), targetFolderId)
            //sprawdź czy docelowy folder jest inny niż obecny parent
            if (currentParentFolder.getId() === targetFolderId)
                sameParentFound = true;
        }

        targetFolder.addFolder(sourceFolder);

        if (!sameParentFound)
            currentParentFolder.removeFolder(sourceFolder);
    },

    copyFolder: function (sourceFolderId, targetFolderId) {
        var sourceFolder = DriveApp.getFolderById(sourceFolderId);
        var targetFolder = DriveApp.getFolderById(targetFolderId);

        var folders = sourceFolder.getFolders();
        var files = sourceFolder.getFiles();

        while (files.hasNext()) {
            var file = files.next();
            file.makeCopy(file.getName(), targetFolder);
        }

        while (folders.hasNext()) {
            var subFolder = folders.next();
            var folderName = subFolder.getName();
            var targetFolder = targetFolder.createFolder(folderName);
            this.copyFolder(subFolder.getId(), targetFolder.getId());
        }
    }
}

function test_moveFolder() {
    var item = JSON.parse('');
    var contract = new Contract(item, undefined)
    var gd = new Gd(contract);

    var destinationFolderId = (contract._ourContract.id) ? contract._ourContract.gdFolderId : gd.projectFolder;
    gd.moveFolder(contract.gdFolderId, destinationFolderId);
}