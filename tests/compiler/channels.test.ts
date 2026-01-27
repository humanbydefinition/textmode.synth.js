import { describe, it, expect } from 'vitest';
import { getTextureChannel, updateChannelUsage } from '../../src/compiler/channels';
import type { ChannelUsage } from '../../src/compiler/types';

describe('Compiler Channels', () => {
    describe('getTextureChannel', () => {
        it('should return "char" for "char" target', () => {
            expect(getTextureChannel('char')).toBe('char');
        });

        it('should return "cellColor" for "cellColor" target', () => {
            expect(getTextureChannel('cellColor')).toBe('cellColor');
        });

        it('should return "charColor" for "charColor" target', () => {
            expect(getTextureChannel('charColor')).toBe('charColor');
        });

        it('should return "charColor" for "main" target', () => {
            expect(getTextureChannel('main')).toBe('charColor');
        });
    });

    describe('updateChannelUsage', () => {
        it('should mark usesChar for "char" target', () => {
            const usage: ChannelUsage = {
                usesChar: false,
                usesCharColor: false,
                usesCellColor: false
            };
            updateChannelUsage(usage, 'char');
            expect(usage.usesChar).toBe(true);
            expect(usage.usesCharColor).toBe(false);
            expect(usage.usesCellColor).toBe(false);
        });

        it('should mark usesCellColor for "cellColor" target', () => {
            const usage: ChannelUsage = {
                usesChar: false,
                usesCharColor: false,
                usesCellColor: false
            };
            updateChannelUsage(usage, 'cellColor');
            expect(usage.usesChar).toBe(false);
            expect(usage.usesCharColor).toBe(false);
            expect(usage.usesCellColor).toBe(true);
        });

        it('should mark usesCharColor for "charColor" target', () => {
            const usage: ChannelUsage = {
                usesChar: false,
                usesCharColor: false,
                usesCellColor: false
            };
            updateChannelUsage(usage, 'charColor');
            expect(usage.usesChar).toBe(false);
            expect(usage.usesCharColor).toBe(true);
            expect(usage.usesCellColor).toBe(false);
        });

        it('should mark usesCharColor for "main" target', () => {
            const usage: ChannelUsage = {
                usesChar: false,
                usesCharColor: false,
                usesCellColor: false
            };
            updateChannelUsage(usage, 'main');
            expect(usage.usesChar).toBe(false);
            expect(usage.usesCharColor).toBe(true);
            expect(usage.usesCellColor).toBe(false);
        });

        it('should accumulate flags (not reset them)', () => {
             const usage: ChannelUsage = {
                usesChar: true,
                usesCharColor: false,
                usesCellColor: false
            };
            updateChannelUsage(usage, 'cellColor');
            expect(usage.usesChar).toBe(true);
            expect(usage.usesCellColor).toBe(true);
            expect(usage.usesCharColor).toBe(false);
        });
    });
});
