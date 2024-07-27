export class InsertLayer {
    workspace : string | undefined;
    dbName : string | undefined ;
    layerName : string;
    layerTitle : string | undefined;
    srcName : string | undefined;
    description: string | undefined;
    attr : attr[] =[] ;
    constructor(workspace?: string, dbName?: string, layerName?: string, srcName?: string, description?: string, attr: attr[] = []) {
        this.workspace = workspace;
        this.dbName = dbName;
        this.layerTitle = layerName;
        this.layerName = this.uuidv4();
        this.srcName = srcName;
        this.description = description;
        this.attr = attr;
    }

    uuidv4() {
        return "10000000".replace(/[018]/g, c =>
            (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
        );
    }
}

export class attr {
    name: string | undefined;
    isNull: boolean = true ;
    type: string | undefined;
}