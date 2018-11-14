//@ts-check
import * as ol from 'openlayers';
const { geom, proj, style, layer, source, interaction, format, loadingstrategy, tilegrid } = ol;
const { Style, Circle: CircleStyle, Fill, Stroke, Text } = style;
const { Stamen, Vector: VectorSource } = source;
const { Heatmap } = layer;
const { KML } = format;
const { GeoJSON } = format;

export class DensityLayer {
    async getData(extent, resolution, projection) {
        const data = await fetch(`/api/density/${extent[0]}/${extent[1]}/${extent[2]}/${extent[3]}/${resolution}`);
        const json = await data.json();
        const markers = (new GeoJSON()).readFeatures(json).map((marker) => {
            // transform coordinates projection
            marker.getGeometry().setCoordinates(
                proj.fromLonLat(marker.getGeometry().getCoordinates())
            );
            return marker;
        });

        this.addFeatures(markers);
    }

    constructor() {
        const source = new VectorSource({
            loader: this.getData,
            strategy: loadingstrategy.tile(tilegrid.createXYZ({
                maxZoom: 19
            })),
        });

        const layer = new Heatmap({
            source,
            blur: 30,
            radius: 10,
            weight: (f) => {
                return f.get('weight').toString();
            },
        });
        
        return layer;
    }
}