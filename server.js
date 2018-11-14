const express = require('express');
const app = express();
const geojson = require('geojson');

app.use(express.static('.'));

app.get('/api/tile/:x/:y/:z', (req, res) => {
    res.sendFile('data/sample-tile.png', { root: __dirname });
})
app.get('/api/markers', (req, res) => {
    const washington = [-77.105665, 38.861637];
    const markers = [];
    for(var i=0; i<100; i++) {
        markers.push({
            lat: washington[0] + (Math.random() * 10),
            lng: washington[1] + (Math.random() * 10)
        });
    }

    res.send(geojson.parse(markers, {Point: ['lat', 'lng']}));
});

app.listen(3000, function () {
  console.log('App listening on port 3000');
});