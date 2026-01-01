import { textmode } from 'textmode.js';
import { SynthPlugin, shape } from 'textmode.synth.js';

const t = textmode.create({
    width: window.innerWidth,
    height: window.innerHeight,
    fontSize: 16,
    plugins: [SynthPlugin]
});

t.layers.base.synth(
    shape(3).repeatY(3, 0)
);
t.windowResized(() => {
    t.resizeCanvas(window.innerWidth, window.innerHeight);
});

