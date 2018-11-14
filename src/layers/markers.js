//@ts-check
import * as ol from 'openlayers';
const { Feature, geom, proj, style, layer, source, interaction, events, format } = ol;
const { Vector: VectorSource, Cluster } = source;
const { Point } = geom;
const { Style, Icon, Circle: CircleStyle, Fill, Stroke, Text } = style;
const { Vector } = layer;
const { defaults: defaultInteractions, Select } = interaction;
const { GeoJSON } = format;

const washington = [-77.105665, 38.861637];
const iconStyle = new Style({
  image: new Icon({
    src: 'data/marker.png'
  })
});    

export class SingleMarkerLayer {
    constructor() {
        const iconFeature = new Feature({
            geometry: new Point(proj.fromLonLat(washington)),
            name: 'Washington, DC',
          });          
          
          const vectorSource = new ol.source.Vector({
            features: [ iconFeature ]
          });                
          
          return new Vector({
            source: vectorSource,
            style: iconStyle
          });
    }
}

export class ClusteredMarkersLayer {
    static getInteractions() {
        const onClick = new Select({
            condition: events.condition.click,                
        });
        onClick.on('select', function (e) {
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

        return defaultInteractions().extend([
            onClick,
        ]);
    }

    async getData() {
        const data = await fetch('/api/markers');
        const json = await data.json();
        const markers = (new GeoJSON()).readFeatures(json)
        this.clusterSource.getSource().addFeatures(markers);
    }

    constructor(distance = 10, count = 100) {
        this.features = [];        

        this.source = new VectorSource({
            features: this.features,
        });

        this.clusterSource = new Cluster({
            distance,
            source: this.source,
        });

        this.styleCache = [];
        this.layer = new Vector({
            source: this.clusterSource,
            style: (feature) => {
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
            },
        });

        this.getData();

        return this.layer;
    }
}
