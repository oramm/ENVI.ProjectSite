class Entity {
  id: number;
  name: string;
  address: string;
  taxNumber?: string;
  www: string;
  email: string;
  phone: string;
  fax: string;
  constructor(initParamObject) {
    if (initParamObject) {
      this.id = initParamObject.id;
      if (initParamObject.name)
        this.name = initParamObject.name.trim();
      this.address = initParamObject.address;
      if (initParamObject.taxNumber)
        this.taxNumber = initParamObject.taxNumber;
      this.www = initParamObject.www;
      this.email = initParamObject.email;
      this.phone = initParamObject.phone;
      this.fax = initParamObject.fax;

    }
  }
  addInDb(conn?, isPartOfTransaction?) {
    return addInDb('Entities', this, conn, isPartOfTransaction);
  }

  editInDb(externalConn?, isPartOfTransaction?) {
    editInDb('Entities', this, externalConn, isPartOfTransaction);
  }

  deleteFromDb() {
    deleteFromDb('Entities', this, undefined, undefined);
  }
}

