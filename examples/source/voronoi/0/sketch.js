import { textmode } from 'textmode.js';
import { SynthPlugin, voronoi } from 'textmode.synth.js';

const t = textmode.create({
    width: window.innerWidth,
    height: window.innerHeight,
    fontSize: 16,
    plugins: [SynthPlugin]
});

t.layers.base.synth(
    voronoi(5, 0.3, 0.3)
);
t.windowResized(() => {
    t.resizeCanvas(window.innerWidth, window.innerHeight);
});

