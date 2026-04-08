import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

(function () {
  const IMG_W = 1536, IMG_H = 1024;

  const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -1,
    maxZoom: 3,
    zoomSnap: 0.5,
    zoomDelta: 0.5,
    doubleClickZoom: false,
    attributionControl: false,
  });

  const bounds = [[0, 0], [IMG_H, IMG_W]];
  L.imageOverlay('images/world-map.webp', bounds).addTo(map);
  map.fitBounds(bounds);
  map.setMaxBounds([[-100, -100], [IMG_H + 100, IMG_W + 100]]);

  fetch('map-data.json?v=' + Date.now())
    .then((r) => r.json())
    .then((data) => {
      const partyId = data.partyLocation;
      data.markers.forEach((marker) => {
        const isParty = marker.id === partyId;
        const type = marker.type || 'landmark';
        const size = type === 'landmark' ? 14 : 18;

        const icon = L.divIcon({
          className: 'map-marker type-' + type + (isParty ? ' party-location' : ''),
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          popupAnchor: [0, -(size / 2 + 4)],
        });

        const lm = L.marker(marker.coords, { icon: icon }).addTo(map);

        let html = '<div class="map-popup">';
        html += '<div class="map-popup-name">' + esc(marker.name) + '</div>';
        if (marker.subtitle) html += '<div class="map-popup-subtitle">' + esc(marker.subtitle) + '</div>';
        if (marker.sovereign) html += '<div class="map-popup-sovereign">' + esc(marker.sovereign) + '</div>';
        if (isParty) html += '<div class="map-popup-party">&#9733; Party is here</div>';
        if (marker.description) html += '<div class="map-popup-desc">' + esc(marker.description) + '</div>';
        if (marker.link) {
          html += '<a class="map-popup-link" data-category="' + marker.link.category + '" data-id="' + marker.link.id + '">Open in Compendium &rarr;</a>';
        }
        html += '</div>';

        lm.bindPopup(html, { maxWidth: 300, minWidth: 200 });

        lm.on('popupopen', () => {
          const link = lm.getPopup().getElement().querySelector('.map-popup-link');
          if (link) {
            link.addEventListener('click', (e) => {
              e.preventDefault();
              window.parent.postMessage(
                {
                  type: 'map-navigate',
                  category: link.dataset.category,
                  id: link.dataset.id,
                },
                '*'
              );
            });
          }
        });
      });
    });

  // Shift+Click coordinate helper
  const toast = document.getElementById('toast');
  map.on('click', function (e) {
    if (e.originalEvent.shiftKey) {
      const lat = Math.round(e.latlng.lat);
      const lng = Math.round(e.latlng.lng);
      const text = '[' + lat + ', ' + lng + ']';
      toast.textContent = 'Coords: ' + text + ' (copied!)';
      toast.classList.add('visible');
      navigator.clipboard.writeText(text).catch(function () {});
      setTimeout(function () {
        toast.classList.remove('visible');
      }, 2500);
    }
  });

  function esc(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }
})();
