//@ts-check
import * as ol from 'openlayers';
import { projection } from './const';
import { CustomTileLayer, OSMTileLayer } from './layers/tiles';
import { SingleMarkerLayer, ClusteredMarkersLayer } from './layers/markers';
import { DensityLayer } from './layers/density';
const { Map, View, layer } = ol;

const customTileLayer = new CustomTileLayer();
const osmTileLayer = new OSMTileLayer();
const singleMarkerLayer = new SingleMarkerLayer();
const clusteredMarkersLayer = new ClusteredMarkersLayer(100);
const densityLayer = new DensityLayer();

customTileLayer.setVisible(false);
singleMarkerLayer.setVisible(false);
clusteredMarkersLayer.setVisible(false);
densityLayer.setVisible(false);

const layers = [
    osmTileLayer,
    customTileLayer,
    singleMarkerLayer,
    clusteredMarkersLayer,
    densityLayer,
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
    renderer: 'canvas'
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
document.querySelector("#show-density-map").addEventListener("change", (e) => {
    densityLayer.setVisible(e.target.checked);
});
