//@ts-check
import * as ol from 'openlayers';
import { extent, projection } from './const';
import { CustomTileLayer, OSMTileLayer } from './layers/tiles';
import { SingleMarkerLayer, ClusteredMarkersLayer } from './layers/markers';
const { Map, View, source, layer, format } = ol;
const { Heatmap: HeatmapLayer } = layer;
const { OSM, TileDebug, Stamen, Vector: VectorSource } = source;
const { KML } = format;

const customTileLayer = new CustomTileLayer();
const osmTileLayer = new OSMTileLayer();
const singleMarkerLayer = new SingleMarkerLayer();
const clusteredMarkersLayer = new ClusteredMarkersLayer(100);

customTileLayer.setVisible(false);
singleMarkerLayer.setVisible(false);
// clusteredMarkersLayer.setVisible(false);

const layers = [
    osmTileLayer,
    customTileLayer,
    singleMarkerLayer,
    clusteredMarkersLayer,
];

const map = new Map({
    target: 'map',
    view: new View({
        center: [-10997148, 4569099],
        zoom: 4,
    }),
    projection,
    layers,
    interactions: ClusteredMarkersLayer.getInteractions(),
});

document.querySelectorAll('#osm-tiles, #custom-tiles').forEach((btn) => {
    btn.addEventListener('change', (e) => {
        switch (e.target.id) {
            case 'osm-tiles':
                osmTileLayer.setVisible(true);
                customTileLayer.setVisible(false);
                break;
            default:
                osmTileLayer.setVisible(false);
                customTileLayer.setVisible(true);
                break;
        }
    });
});
document.querySelector("#single-marker").addEventListener("change", (e) => {
    singleMarkerLayer.setVisible(e.target.checked);
});
document.querySelector("#clustered-markers").addEventListener("change", (e) => {
    clusteredMarkersLayer.setVisible(e.target.checked);
});

const vector = new HeatmapLayer({
  extent,
  source: new VectorSource({
    url: '/data/kml/2012_Earthquakes_Mag5.kml',
    format: new KML({
      extractStyles: false
    })
  }),
  blur: 15,
  radius: 15,
  weight: '1',
});
vector.getSource().on('addfeature', function(event) {
  // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
  // standards-violating <magnitude> tag in each Placemark.  We extract it from
  // the Placemark's name instead.
  var name = event.feature.get('name');
  var magnitude = parseFloat(name.substr(2));
  event.feature.set('weight', magnitude - 5);
});


