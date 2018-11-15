//@ts-check
import * as ol from 'openlayers';
import turf from '@turf/turf';
import { Layer } from '../Layer';
const { Feature, geom, proj, style, layer, source, interaction, format, events } = ol;
const { Select } = interaction;
const { condition } = events;
const { Style, Circle: CircleStyle, Fill, Stroke, Text } = style;
const { Stamen, Vector: VectorSource } = source;
const { Heatmap, Vector } = layer;
const { GeoJSON } = format;
const { MultiPoint } = geom;

export class DensityLayer extends Layer {
    get fill() {
        return [
            'rgba(193, 157, 95, 0.2)',
            'rgba(129, 181, 98, 0.2)',
            'rgba(108, 181, 152, 0.2)',
            'rgba(98, 181, 178, 0.2)',
            'rgba(87, 181, 205, 0.2)',
        ];
    }

    get fillSelected() {
        return [
            'rgba(193, 157, 95, 0.5)',
            'rgba(129, 181, 98, 0.5)',
            'rgba(108, 181, 152, 0.5)',
            'rgba(98, 181, 178, 0.5)',
            'rgba(87, 181, 205, 0.5)',
        ];
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
        return [
            new Style({
                stroke: new Stroke({
                    color: `rgba(0, 0, 0, ${isSelected ? '0.5' : '0.3'})`,
                    width: 1,
                }),
                fill: new Fill({
                    color: isSelected
                        ? this.fillSelected[feature.get('weight')]
                        : this.fill[feature.get('weight')],
                })
            })
        ];
    }

    async getData(extent, resolution, projection) {
        const data = await fetch(`/api/density/${extent[0]}/${extent[1]}/${extent[2]}/${extent[3]}/${resolution}`);
        const json = await data.json();
        const markers = (new GeoJSON()).readFeatures(json).map((marker) => {
            // transform coordinates projection
            const polygons = marker.getGeometry().getCoordinates();
            marker.getGeometry().setCoordinates(
                polygons.map(poly => {
                    return poly.map(c => proj.fromLonLat(c))
                        .filter(c => !isNaN(c[0]) && !isNaN(c[1]))
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