//@ts-check
import * as ol from 'openlayers';
import { Layer } from '../Layer';
const { Feature, geom, proj, style, layer, source, interaction, format, events } = ol;
const { Select } = interaction;
const { condition } = events;
const { Style, Fill, Stroke } = style;
const { Vector: VectorSource } = source;
const { Vector } = layer;
const { TopoJSON } = format;

export class DensityLayer extends Layer {
    getColor(weight, isSelected) {
        const opacity = isSelected ? 0.5: 0.2;
        const colors = {
            'border': [0, 0, 0, opacity],
            // the following colors are just for sample
            '1': [193, 157, 95, opacity],
            '2': [129, 181, 98, opacity],
            '3': [108, 181, 152, opacity],
            '4': [98, 181, 178, opacity],
            '5': [87, 181, 205, opacity],
            '6': [193, 157, 95, opacity],
            '7': [129, 181, 98, opacity],
            '8': [108, 181, 152, opacity],
            '9': [98, 181, 178, opacity],
            '10': [87, 181, 205, opacity],
        };

        return colors[weight];
    }

    getInteractions() {
        const interaction = new Select({
            condition: condition.pointerMove,
            filter: (feature, layer) => {
                return layer.get('name') === 'density'
            },
            style: feature => this.getStyle(feature, true),
        });

        return [interaction];
    }

    getStyle(feature, isSelected = false) {
        const color = this.getColor(feature.get('weight'), isSelected);
        const style = [new Style({
            stroke: new Stroke({
                color: this.getColor('weight', isSelected),
                width: 1,
            }),
            fill: new Fill({
                color,
            }),
        })];
        console.log(feature, feature.get('weight'), style, color)
        return style;
    }

    async getData(extent, resolution, projection) {
        const data = await fetch(`/api/density/${extent[0]}/${extent[1]}/${extent[2]}/${extent[3]}/${resolution}`);
        const json = await data.json();
        const markers = (new TopoJSON({ layers: Object.keys(json.objects) })).readFeatures(json).map((marker) => {
            // transform coordinates projection
            const geom = marker.getGeometry();
            geom.translate(25.4, 14.4);
            const polygons = geom.getCoordinates();
            geom.setCoordinates(
                polygons.map(poly => {
                    return poly.map(c => proj.fromLonLat(c))
                    }
                )
            );
            return marker;
        });

        this.addFeatures(markers);
    }

    constructor() {
        super();
        this.source = new VectorSource({
            loader: this.getData,
        });

        this.layer = new Vector({
            name: 'density',
            source: this.source,
            style: f => this.getStyle(f),
        });        
    }
}