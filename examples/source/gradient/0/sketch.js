import { textmode } from 'textmode.js';
import { SynthPlugin, gradient } from 'textmode.synth.js';

const t = textmode.create({
    width: window.innerWidth,
    height: window.innerHeight,
    fontSize: 16,
    plugins: [SynthPlugin]
});

t.layers.base.synth(
    gradient([1, 2, 4])
);
t.windowResized(() => {
    t.resizeCanvas(window.innerWidth, window.innerHeight);
});
