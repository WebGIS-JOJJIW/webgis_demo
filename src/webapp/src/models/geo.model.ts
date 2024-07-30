export class InsertLayer {
    workspace : string | undefined;
    dbName : string | undefined ;
    layerName : string ='';
    srcName : string | undefined;
    description: string | undefined;
    attr : attr[] =[] ;
    constructor(workspace?: string, dbName?: string, layerName?: string, srcName?: string, description?: string, attr: attr[] = []) {
        this.workspace = workspace;
        this.dbName = dbName;
        this.layerName = layerName+''; 
        this.srcName = srcName;
        this.description = description;
        this.attr = attr;
    }
}

export class attr {
    name: string | undefined;
    isNull: boolean = true ;
    type: string | undefined;
}