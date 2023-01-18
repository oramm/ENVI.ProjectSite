class StaticRepository extends Repository {
    constructor(initParamObject: {
        name: string,
        items: any[]
    }) {
        super(initParamObject);
        this.items = initParamObject.items;
    }
};