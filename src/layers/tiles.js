//@ts-check
import * as ol from 'openlayers';
import { Layer } from '../Layer';
const { source, layer } = ol;
const { Tile: TileLayer } = layer;
const { XYZ, OSM } = source;

export class CustomTileLayer extends Layer {

    constructor() {
        super();
        this.layer = new TileLayer({
            source: new OSM({
                url: `http://testatlas.arachnenetwork.com:3000/osm_tiles/{z}/{x}/{y}.png`,
            })
        });
    }
}

export class OSMTileLayer extends Layer {
    constructor() {
        super();
        this.layer = new TileLayer({
            source: new OSM(),
        });
    }
}