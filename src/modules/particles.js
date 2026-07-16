export async function initParticles() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const [{ tsParticles }, { loadSlim }] = await Promise.all([
    import('@tsparticles/engine'),
    import('@tsparticles/slim'),
  ]);
  await loadSlim(tsParticles);

  tsParticles.load({
    id: "tsparticles",
    options: {
      fullScreen: false,
      fpsLimit: 60,
      background: {
        color: "transparent"
      },
      particles: {
        number: {
          value: 35,
          density: {
            enable: true,
            area: 1200
          }
        },
        color: {
          value: ["#c9a227", "#e8d59e", "#8b1a32", "#ff6b35"]
        },
        shape: {
          type: "circle"
        },
        opacity: {
          value: { min: 0.15, max: 0.4 },
          animation: {
            enable: true,
            speed: 0.3,
            minimumValue: 0.1,
            sync: false
          }
        },
        size: {
          value: { min: 1, max: 3 },
          animation: {
            enable: false
          }
        },
        move: {
          enable: true,
          speed: 0.4,
          direction: "top",
          random: false,
          straight: false,
          outModes: {
            default: "out"
          },
          drift: 0
        },
        wobble: {
          enable: true,
          distance: 3,
          speed: 1
        },
        twinkle: {
          particles: {
            enable: true,
            frequency: 0.02,
            opacity: 0.6,
            color: {
              value: "#c9a227"
            }
          }
        }
      },
      detectRetina: true
    }
  });
}
