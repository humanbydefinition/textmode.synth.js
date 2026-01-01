/**
 * TransformFactory - Dynamic method generation for SynthSource.
 *
 * This module handles the dynamic generation of chainable methods on
 * SynthSource based on registered transform definitions. It eliminates
 * the need to manually write boilerplate methods for each transform.
 */
import type { TransformDefinition } from './TransformDefinition';
import type { SynthParameterValue } from '../core/types';
/**
 * Interface for the SynthSource class that will have methods injected.
 * This is used to avoid circular dependencies.
 */
export interface SynthSourcePrototype {
    addTransform(name: string, userArgs: SynthParameterValue[]): unknown;
    addCombineTransform(name: string, source: unknown, userArgs: SynthParameterValue[]): unknown;
}
/**
 * Generated standalone functions for source transforms.
 */
export interface GeneratedFunctions {
    [name: string]: (...args: SynthParameterValue[]) => unknown;
}
/**
 * Factory for generating dynamic transform methods.
 */
declare class TransformFactory {
    private _generatedFunctions;
    private _synthSourceClass;
    /**
     * Set the SynthSource class to inject methods into.
     * This must be called before injectMethods.
     */
    setSynthSourceClass(cls: new () => SynthSourcePrototype): void;
    /**
     * Inject chainable methods into the SynthSource prototype.
     * This dynamically adds all registered transforms as methods.
     */
    injectMethods(prototype: SynthSourcePrototype): void;
    /**
     * Inject a single method for a transform.
     */
    private _injectMethod;
    /**
     * Generate standalone functions for source-type transforms.
     * These allow starting a chain without explicitly creating a SynthSource.
     */
    generateStandaloneFunctions(): GeneratedFunctions;
    /**
     * Get the generated standalone functions.
     */
    getGeneratedFunctions(): GeneratedFunctions;
    /**
     * Add a new transform and inject its method.
     * This can be used to add custom transforms at runtime.
     */
    addTransform(transform: TransformDefinition, prototype?: SynthSourcePrototype): void;
}
/**
 * Singleton instance of the transform factory.
 */
export declare const transformFactory: TransformFactory;
export {};
//# sourceMappingURL=TransformFactory.d.ts.map