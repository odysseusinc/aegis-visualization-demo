//@ts-check
import * as ol from 'openlayers';
import { projection, washington } from './const';
import { CustomTileLayer, OSMTileLayer } from './layers/tiles';
import { SingleMarkerLayer, ClusteredMarkersLayer } from './layers/markers';
import { DensityLayer } from './layers/density';
const { Map, View, proj } = ol;

const customTileLayer = new CustomTileLayer();
const osmTileLayer = new OSMTileLayer();
const singleMarkerLayer = new SingleMarkerLayer();
const clusteredMarkersLayer = new ClusteredMarkersLayer(100);
const densityLayer = new DensityLayer();

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
        center: proj.fromLonLat(washington),
        zoom: 8,
    }),
    projection,
    renderer: 'canvas'
});

layers.forEach((layerContainer) => {
    const layer = layerContainer.layer;
    layer.setVisible(false);
    map.addLayer(layer);
    layerContainer.getInteractions().forEach((interaction) => {
        map.addInteraction(interaction);
    });
});

// OSM is visible by default
layers[0].layer.setVisible(true);

document.querySelectorAll('#osm-tiles, #custom-tiles').forEach((btn) => {
    btn.addEventListener('change', (e) => {
        switch (e.target.id) {
            case 'osm-tiles':
                osmTileLayer.layer.setVisible(true);
                customTileLayer.layer.setVisible(false);
                break;
            default:
                osmTileLayer.layer.setVisible(false);
                customTileLayer.layer.setVisible(true);
                break;
        }
    });
});
document.querySelector("#single-marker").addEventListener("change", (e) => {
    singleMarkerLayer.layer.setVisible(e.target.checked);
});
document.querySelector("#clustered-markers").addEventListener("change", (e) => {
    clusteredMarkersLayer.layer.setVisible(e.target.checked);
});
document.querySelector("#show-density-map").addEventListener("change", (e) => {
    densityLayer.layer.setVisible(e.target.checked);
});
