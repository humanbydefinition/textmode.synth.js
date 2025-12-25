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
synthLayer.synth(
    charGradient(255, 1)
        .scrollY(1, 0.01)
        .charColor(gradient(0.21))
        .cellColor(
            gradient(0.65)
                .invert((ctx) => Math.sin(ctx.time) * 2)
        )
);

t.draw(() => {
    // The synth renders automatically before this callback
    // You can draw additional content on top here
});

t.windowResized(() => {
    t.resizeCanvas(window.innerWidth, window.innerHeight);
});