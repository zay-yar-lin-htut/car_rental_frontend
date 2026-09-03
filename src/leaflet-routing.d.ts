import * as L from "leaflet";

declare module "leaflet" {
    namespace Routing {
        let control: any;
        let TomTom: any;
        let tomTom: any;
        class Control extends L.Control {}
    }
}
