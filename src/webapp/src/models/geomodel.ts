export class InsertLayer {
    workspace : string | undefined;
    dbName : string | undefined ;
    layerName : string | undefined;
    srcName : string | undefined;
    attr : attr[] =[] ;

}

export class attr {
    name: string | undefined;
    isNull: boolean = true;
    type: string | undefined;
}