// Embers rise in the present and the Archive; on the eve the air carries
// slow, sunlit motes instead. The realm can change before the particle engine
// has loaded, so the wanted realm is kept and used at start-up.
let engine = null;
let wantedRealm = 'living';

function optionsFor(realm) {
  const eve = realm === 'eve';
  return {
    fullScreen: false,
    fpsLimit: 60,
    background: {
      color: "transparent"
    },
    particles: {
      number: {
        value: eve ? 42 : 35,
        density: {
          enable: true,
          area: 1200
        }
      },
      color: {
        value: eve
          ? ["#f6e7b0", "#fff8e0", "#d9e8a8", "#f0d27a"]
          : ["#c9a227", "#e8d59e", "#8b1a32", "#ff6b35"]
      },
      shape: {
        type: "circle"
      },
      opacity: {
        value: eve ? { min: 0.2, max: 0.55 } : { min: 0.15, max: 0.4 },
        animation: {
          enable: true,
          speed: 0.3,
          minimumValue: 0.1,
          sync: false
        }
      },
      size: {
        value: eve ? { min: 1, max: 2.6 } : { min: 1, max: 3 },
        animation: {
          enable: false
        }
      },
      move: {
        enable: true,
        speed: eve ? 0.25 : 0.4,
        direction: eve ? "bottom-right" : "top",
        random: eve,
        straight: false,
        outModes: {
          default: "out"
        },
        drift: 0
      },
      wobble: {
        enable: true,
        distance: eve ? 5 : 3,
        speed: 1
      },
      twinkle: {
        particles: {
          enable: true,
          frequency: 0.02,
          opacity: 0.6,
          color: {
            value: eve ? "#fff3c4" : "#c9a227"
          }
        }
      }
    },
    detectRetina: true
  };
}

function load() {
  return engine.load({ id: "tsparticles", options: optionsFor(wantedRealm) });
}

export async function initParticles() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const [{ tsParticles }, { loadSlim }] = await Promise.all([
    import('@tsparticles/engine'),
    import('@tsparticles/slim'),
  ]);
  await loadSlim(tsParticles);
  engine = tsParticles;
  await load();
}

export function setParticleRealm(realm) {
  const next = realm === 'eve' ? 'eve' : 'living';
  if (next === wantedRealm) return;
  wantedRealm = next;
  if (engine) load().catch(() => {});
}
