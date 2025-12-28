import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charGradient, gradient, osc, solid } from 'textmode.synth.js';

const t = textmode.create({
    width: window.innerWidth,
    height: window.innerHeight,
    fontSize: 16,
    plugins: [SynthPlugin]
});

const synthLayer = t.layers.add();

// Can be called globally, just like layer.draw()!
t.layers.base.synth(
    charGradient([1,2,4], 16)
        .charColor(
            gradient([1,2,4])
        )
        .cellColor(
            gradient([1,2,4])
                .invert()
        )
);

t.draw(() => {

});

t.windowResized(() => {
    t.resizeCanvas(window.innerWidth, window.innerHeight);
});