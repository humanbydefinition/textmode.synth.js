import { textmode } from 'textmode.js';
import { SynthPlugin, voronoi } from 'textmode.synth.js';

const t = textmode.create({
    width: window.innerWidth,
    height: window.innerHeight,
    fontSize: 16,
    plugins: [SynthPlugin]
});

t.layers.base.synth(
    voronoi(25, 2, 10).color(1, 1, 0).brightness(0.15)
        .charMap(' .')
);
t.windowResized(() => {
    t.resizeCanvas(window.innerWidth, window.innerHeight);
});

