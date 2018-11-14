//@ts-check
import * as ol from 'openlayers';
const { source, layer } = ol;
const { Tile: TileLayer } = layer;
const { XYZ, OSM } = source;

export class CustomTileLayer {
    getUrl(tileCoord) {
        const z = (tileCoord[0] - 1).toString();
        const x = tileCoord[1].toString();
        const y = (-tileCoord[2] - 1).toString();
        
        return `/api/tile/${z}/${y}/${x}`;
    }

    constructor(tileSize = 512) {
        const src = new XYZ({
            maxZoom: 16,
            projection: 'EPSG:4326',
            tileSize: tileSize,
            tileUrlFunction: this.getUrl,
            wrapX: true,
        });

        return new TileLayer({
            source: src
        });
    }
}

export class OSMTileLayer {
    constructor() {
        return new TileLayer({
            source: new OSM(),
        });
    }
}