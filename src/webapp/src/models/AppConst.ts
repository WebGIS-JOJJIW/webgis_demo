export class AppConst{
    public static  LivePage: string = 'live';
    public static  DronePage: string = 'drone';
    public static  MapEditorPage: string = 'map-editor';
    
    public static PageShowSideAll: { [key: string]: number[] } = {
        [AppConst.LivePage]: [1, 2, 3, 4, 5],
        [AppConst.MapEditorPage]: [1],
        [AppConst.DronePage]: [1]
    };
                                    
}