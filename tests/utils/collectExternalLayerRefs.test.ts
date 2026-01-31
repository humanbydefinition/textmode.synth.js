import { describe, it, expect } from 'vitest';
import { collectExternalLayerRefs } from '../../src/utils/collectExternalLayerRefs';
import { SynthSource } from '../../src/core/SynthSource';
import type { ExternalLayerReference } from '../../src/core/types';
import type { TextmodeLayer } from 'textmode.js/layering';

// Mock TextmodeLayer - just needs to be an object for reference equality
const createMockLayer = (id: string): TextmodeLayer => {
    return { id } as unknown as TextmodeLayer;
};

describe('collectExternalLayerRefs', () => {
    it('should return empty map for empty source', () => {
        const source = new SynthSource();
        const refs = collectExternalLayerRefs(source);
        expect(refs.size).toBe(0);
    });

    it('should collect direct external layer references', () => {
        const layer1 = createMockLayer('layer1');
        const ref1: ExternalLayerReference = { layerId: 'layer1', layer: layer1 };

        const externalLayerRefs = new Map<number, ExternalLayerReference>();
        externalLayerRefs.set(0, ref1);

        const source = new SynthSource({ externalLayerRefs });
        const refs = collectExternalLayerRefs(source);

        expect(refs.size).toBe(1);
        expect(refs.get('layer1')).toBe(layer1);
    });

    it('should collect references from nested sources', () => {
        const layer1 = createMockLayer('layer1');
        const ref1: ExternalLayerReference = { layerId: 'layer1', layer: layer1 };

        const nestedExternalLayerRefs = new Map<number, ExternalLayerReference>();
        nestedExternalLayerRefs.set(0, ref1);
        const nestedSource = new SynthSource({ externalLayerRefs: nestedExternalLayerRefs });

        const nestedSources = new Map<number, SynthSource>();
        nestedSources.set(0, nestedSource);

        const source = new SynthSource({ nestedSources });
        const refs = collectExternalLayerRefs(source);

        expect(refs.size).toBe(1);
        expect(refs.get('layer1')).toBe(layer1);
    });

    it('should collect references from char/color/cellColor sources', () => {
        const layer1 = createMockLayer('layer1');
        const layer2 = createMockLayer('layer2');
        const layer3 = createMockLayer('layer3');

        const ref1: ExternalLayerReference = { layerId: 'layer1', layer: layer1 };
        const ref2: ExternalLayerReference = { layerId: 'layer2', layer: layer2 };
        const ref3: ExternalLayerReference = { layerId: 'layer3', layer: layer3 };

        const charSource = new SynthSource({
            externalLayerRefs: new Map([[0, ref1]])
        });
        const charColorSource = new SynthSource({
            externalLayerRefs: new Map([[0, ref2]])
        });
        const cellColorSource = new SynthSource({
            externalLayerRefs: new Map([[0, ref3]])
        });

        const source = new SynthSource({
            charSource,
            charColorSource,
            cellColorSource
        });

        const refs = collectExternalLayerRefs(source);

        expect(refs.size).toBe(3);
        expect(refs.get('layer1')).toBe(layer1);
        expect(refs.get('layer2')).toBe(layer2);
        expect(refs.get('layer3')).toBe(layer3);
    });

    it('should deduplicate references by layer ID', () => {
        const layer1 = createMockLayer('layer1');
        const ref1: ExternalLayerReference = { layerId: 'layer1', layer: layer1 };

        // Same layer referenced in multiple places
        const charSource = new SynthSource({
            externalLayerRefs: new Map([[0, ref1]])
        });

        const source = new SynthSource({
            charSource,
            externalLayerRefs: new Map([[1, ref1]]) // Same ref in main source
        });

        const refs = collectExternalLayerRefs(source);

        expect(refs.size).toBe(1);
        expect(refs.get('layer1')).toBe(layer1);
    });

    it('should handle deeply nested structures', () => {
        const layer1 = createMockLayer('layer1');
        const ref1: ExternalLayerReference = { layerId: 'layer1', layer: layer1 };

        const deepSource = new SynthSource({
            externalLayerRefs: new Map([[0, ref1]])
        });

        const midSource = new SynthSource({
            nestedSources: new Map([[0, deepSource]])
        });

        const source = new SynthSource({
            nestedSources: new Map([[0, midSource]])
        });

        const refs = collectExternalLayerRefs(source);
        expect(refs.size).toBe(1);
        expect(refs.get('layer1')).toBe(layer1);
    });
});
