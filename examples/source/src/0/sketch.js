import { textmode } from 'textmode.js';
import { SynthPlugin, src, noise, shape } from 'textmode.synth.js';

const t = textmode.create({
    width: window.innerWidth,
    height: window.innerHeight,
    fontSize: 8,
    plugins: [SynthPlugin]
});

// Exact hydra translation: src(o0).modulate(noise(3),0.005).blend(shape(4),0.01).out(o0)
t.layers.base.synth(
    src()
        .modulate(noise(3), 0.005)
        .blend(shape(4), 0.01)
);

t.draw(() => {
    // Drawing happens automatically via synth
});

t.windowResized(() => {
    t.resizeCanvas(window.innerWidth, window.innerHeight);
});