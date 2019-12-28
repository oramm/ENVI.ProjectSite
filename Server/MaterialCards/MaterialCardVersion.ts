/* 1. Wniosek materiałowy jest szczególnym typem sprawy
 * 2. Każdy wniosek jest przypisany do kamienia '04 Roboty Nadzór' i do unikalnej  sprawy typu '07.01 Wnioski Materiałowe'
 * 3. Cykl życia sprawy wniosku jest powiązany z cyklem życia powiązanych zadań (CRUD) - dodanie/edycja/usunięcie wniosku tworzy/zmienia/kasuje powiązane zadania
 */

class MaterialCardVersion {
  id?: number;
  _lastUpdated?: any;
  _editor: any;
  editorId: number;
  status: string;
  parentId: number;
  
  constructor(initParamObject) {
    if (initParamObject) {
      this.id = initParamObject.id;
      this.editorId = initParamObject._editor.id;
      this.status = initParamObject.status;
      this.parentId = initParamObject.parentId;
      this._lastUpdated = initParamObject._lastUpdated;
      this._editor = initParamObject._editor;
    }
  }

  addInDb(conn) {
    addInDb('MaterialCardVersions', this, conn, true);
  }


  editInDb(externalConn, isPartOfTransaction) {
    editInDb('MaterialCardVersions', this, externalConn, isPartOfTransaction);
  }

  deleteFromDb() {
    deleteFromDb('MaterialCardVersions', this);
  }
}