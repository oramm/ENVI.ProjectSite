class OurLetterGdFile extends DocumentGdFile {
    constructor(initObjectParamenter: { _template: DocumentTemplate, document: OurLetter }) {
        super(initObjectParamenter);
        this.description = 'projekt: ' + this.document._project.ourId + ', ' +
            this.makeCasesList() + '. ' +
            this.document.description;
    }
    /*
     * Tworzy zakresy nazwane w szablonie - używać przy dodawaniu naszych pism
     */
    public createNamedRanges() {
        GDocsTools.createNamedRangesByTags(this.document.documentGdId, GDocsTools.getNameRangesTagsFromTemplate(this._template.gdId));
    }
    /*
     * tworzy plik z szablonu w folderze pisma na GD
     */
    public create(): GoogleAppsScript.Drive.File {
        super.create();
        GDocsTools.fillNamedRange(this.document.documentGdId, 'address', this.makeEntitiesDataLabel(this.document._entitiesMain));
        GDocsTools.fillNamedRange(this.document.documentGdId, 'description', this.description);
        return this.gdFile;
    }

    edit() {
        super.edit();
        GDocsTools.fillNamedRange(this.document.documentGdId, 'address', this.makeEntitiesDataLabel(this.document._entitiesMain));
        GDocsTools.fillNamedRange(this.document.documentGdId, 'description', this.description);
    }

    private makeCasesList(): string {
        var cases = this.document._cases.map(item => {
            item.contractId = item._parent.contractId;
            return item;
        })
        let casesByContracts = Envi.ToolsArray.groupBy(cases, 'contractId')
        let casesLabel: string = '';
        for (const contractIdItem in casesByContracts) {
            casesLabel += 'kontrakt: '
            casesLabel += casesByContracts[contractIdItem][0]._parent._parent.ourId || casesByContracts[contractIdItem][0]._parent._parent.number;
            casesLabel += ' ' + casesByContracts[contractIdItem][0]._parent._parent.name + ', ';
            casesLabel += (casesByContracts[contractIdItem].length > 1) ? ' sprawy: ' : ' sprawa: ';
            for (const caseItem of casesByContracts[contractIdItem])
                casesLabel += caseItem._typeFolderNumber_TypeName_Number_Name + ', '
        }
        return casesLabel.substring(0, casesLabel.length - 2)
    }

    /*
     * tworzy etykietę z danymi address
     */
    private makeEntitiesDataLabel(entities: any[]) {
        var label = '';
        for (var i = 0; i < entities.length; i++) {
            label += entities[i].name
            if (entities[i].address)
                label += '\n' + entities[i].address;
            if (i < entities.length - 1)
                label += '\n'
        }
        return label;
    }

}

function test_editLetter() {
    editLetter('{"_project":{"qualifiedValue":"10449316.50","totalValue":"17030293.70","_employers":[],"endDate":"2020-12-31","_gdFolderUrl":"https://drive.google.com/drive/folders/1J76VBiOmjv7yVJlj0xa_gJlH1OKFwOvi","_engineers":[{"address":"ul. Jana Brzechwy 3, 49-305 Brzeg","name":"ENVI","taxNumber":"747-156-40-59","id":1}],"gdFolderId":"1J76VBiOmjv7yVJlj0xa_gJlH1OKFwOvi","ourId":"OLE.GWS.01.POIS","lettersGdFolderId":"1DrcTipAku3gnd6T2dO--v4j2yRxeImEN","name":"Rozbudowa i modernizacja oczyszczalni ścieków w Oleśnie oraz rozbudowa i modernizacja sieci kanalizacyjnej i wodociągowej na terenie aglomeracji Olesno","comment":"Projekt obejmuje 16 zadań wod-kan oraz budowę oczyszczalni (zad. 17)","id":20,"_ourId_Alias":"OLE.GWS.01.POIS","startDate":"2018-01-29","status":"W trakcie","dotationValue":"8881919.02"},"_template":{"gdId":"1hkBgKLNW56XzNnj7EwHfxd6givKjiawAPHs5wdsaAo4","name":"Papier firmowy","_nameConentsAlias":"Papier firmowy","description":"czysty papier firmowy","id":1,"_contents":{"caseTypeId":0,"alias":""}},"_gdFolderUrl":"https://drive.google.com/drive/folders/1NUKwY4GdHLMF0I3lGN2uvtBz0kHAoPLj","_lastUpdated":"","description":"roszczenie IK","number":461,"registrationDate":"2020-05-24","id":461,"letterFilesCount":0,"_entitiesMain":[{"letterRole":"MAIN","address":"Lubliniecka 3a, 46-300 Olesno","phone":"34 358 24 84","www":"http://oleskiewodociagi.pl/33/strona-glowna.html","name":"Oleskie Przedsiębiorstwo Wodociągów i Kanalizacji Sp. z o.o.","taxNumber":"5761580396","id":210,"fax":"","email":"biuro@oleskiewodociagi.pl"}],"_contract":{"_contractors":[],"endDate":"2020-12-31","_gdFolderUrl":"https://drive.google.com/drive/folders/1LKVaECdfPgg0C-o1cNrjEaLR5TObhJ1w","gdFolderId":"1LKVaECdfPgg0C-o1cNrjEaLR5TObhJ1w","number":"JRP/1/1093096/3/2018","meetingProtocolsGdFolderId":"1PDR_H0DTBCK_Jmp9kL_t5TeoWMmjTJ5V","contractUrl":"https://drive.google.com/drive/folders/1QP9w62wwBt6Dgj--yzN9ykvcLmbjBG7Z","id":100,"_ourType":"IK","_ourIdName":"OLE.IK.01 Inżynier i Pomoc Techniczna...","_manager":{"surname":"Tymczyszyn","name":"Monika","id":"152","_nameSurnameEmail":"Monika Tymczyszyn: monika.tymczyszyn@envi.com.pl","email":"monika.tymczyszyn@envi.com.pl"},"name":"Inżynier i Pomoc Techniczna","materialCardsGdFolderId":"1fpe_hD4iFohprxHmDOSeXBxyUyhqaNUD","typeId":1,"projectId":"OLE.GWS.01.POIS","startDate":"2018-03-28","status":"W trakcie","_ourIdOrNumber_Alias":"JRP/1/1093096/3/2018 KS, OŚ","ourId":"OLE.IK.01","alias":"KS, OŚ","value":"460000.00","_employers":[],"_type":{"name":"IK","description":"1","id":1,"isOur":true},"_engineers":[],"_ourIdOrNumber_Name":"JRP/1/1093096/3/2018 Inżynier i Pomoc Techniczna...","_admin":{"surname":"Tymczyszyn","name":"Monika","id":"152","_nameSurnameEmail":"Monika Tymczyszyn: monika.tymczyszyn@envi.com.pl","email":"monika.tymczyszyn@envi.com.pl"},"comment":"Inżynier i pomoc techniczna"},"creationDate":"2020-05-24","_editor":{"systemEmail":"marek@envi.com.pl","surname":"","name":"Marek Gazda"},"folderGdId":"1NUKwY4GdHLMF0I3lGN2uvtBz0kHAoPLj","_cases":[{"_gdFolderUrl":"https://drive.google.com/drive/folders/1ze0Jf2xyubqAkrCp7XbFVLTIfuH8AdLH","milestoneId":412,"_type":{"isDefault":true,"isUniquePerMilestone":false,"folderNumber":"00","name":"Umowa  i zmiany","id":85,"milestoneTypeId":1,"_processes":[]},"description":"","_typeFolderNumber_TypeName_Number_Name":"00 Umowa  i zmiany | S01 null","gdFolderId":"1ze0Jf2xyubqAkrCp7XbFVLTIfuH8AdLH","number":1,"_parent":{"_parent":{"number":"JRP/1/1093096/3/2018","ourId":"OLE.IK.01","alias":"KS, OŚ"},"contractId":100,"_type":{"_folderNumber":"01","name":"Administracja","id":1},"id":412,"gdFolderId":"1GRRl1DJbOb0J66ReUKBXCJ3iD8Qnllyb"},"_folderName":"S01","typeId":85,"_displayNumber":"S01","id":1785,"_processesInstances":[],"_risk":{"_parent":{},"overallImpact":0,"probability":0,"_contract":{},"_smallRateLimit":4,"id":0,"_bigRateLimit":12,"_rate":"M"}}],"documentGdId":"1HDD3laR9KyvzFhwR768HeVZsdnYdXgq9hqOvAVK52TE","projectId":20,"_documentOpenUrl":"https://drive.google.com/open?id=1HDD3laR9KyvzFhwR768HeVZsdnYdXgq9hqOvAVK52TE","isOur":true,"_entitiesCc":[]}');
}