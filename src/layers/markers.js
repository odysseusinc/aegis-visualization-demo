//@ts-check
import * as ol from 'openlayers';
import { washington } from '../const';
import { Layer } from '../Layer';
const { Feature, geom, proj, style, layer, source, interaction, events, format, loadingstrategy, tilegrid } = ol;
const { Vector: VectorSource, Cluster } = source;
const { Point } = geom;
const { Style, Icon, Circle: CircleStyle, Fill, Stroke, Text } = style;
const { Vector } = layer;
const { Select } = interaction;
const { GeoJSON } = format;

const iconStyle = new Style({
  image: new Icon({
    src: 'data/marker.png'
  })
});    

export class SingleMarkerLayer extends Layer {
    constructor() {
        super();
        const iconFeature = new Feature({
            geometry: new Point(proj.fromLonLat(washington)),
            name: 'Washington, DC',
        });          
        
        
        const vectorSource = new ol.source.Vector({
            features: [ iconFeature ]
        });                
        
        this.layer = new Vector({
            source: vectorSource,
            style: iconStyle
        });
          
        return this;
    }
}

export class ClusteredMarkersLayer extends Layer {
    getInteractions() {
        const interaction = new Select({
            filter: (feature, layer) => {
                return layer.get('name') === 'cluster'
            },
            style: feature => this.getStyle(feature),
        });
        interaction.on('select', function (e) {
            e.preventDefault();
            if (!e.selected.length) {
                return false;
            }
            const view = this.getMap().getView();
            const extent = e.selected[0].getGeometry().getExtent();
            view.animate({
                center: e.selected[0].getGeometry().getCoordinates(),
                zoom: view.getZoom() + 1,
            });
        })

        return [interaction];
    }

    async getData(extent, resolution, projection) {
        const data = await fetch(`/api/markers/${extent[0]}/${extent[1]}/${extent[2]}/${extent[3]}/${resolution}`);
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

    getStyle(feature) {
        const size = feature.get('features').length;
        let style = this.styleCache[size];
        if (!style) {
            style = new Style({
                image: new CircleStyle({
                    radius: 10,
                    stroke: new Stroke({
                        color: '#fff'
                    }),
                    fill: new Fill({
                        color: '#3399CC'
                    })
                }),
                text: new Text({
                    text: size.toString(),
                    fill: new Fill({
                        color: '#fff'
                    })
                })
            });
            this.styleCache[size] = style;
        }
        return style;
    }

    constructor(distance = 10) {
        super();
        this.source = new VectorSource({
            loader: this.getData,
            strategy: loadingstrategy.tile(tilegrid.createXYZ({
                maxZoom: 19
            })),
        });

        this.clusterSource = new Cluster({
            distance,
            source: this.source,
        });

        this.styleCache = [];
        this.layer = new Vector({
            name: 'cluster',
            source: this.clusterSource,
            style: f => this.getStyle(f),
        });
    }
}
