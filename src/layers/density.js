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
        const data = await fetch(`/api/density?bbox=${extent.join(',')}&resolution=${resolution}`);
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
            blur: 50,
            radius: 30,
            weight: '5',
        });
        layer.getSource().on('addfeature', function(event) {
            const weight = event.feature.get('weight');
            event.feature.set('weight', weight);
        });
        
        return layer;
    }
}