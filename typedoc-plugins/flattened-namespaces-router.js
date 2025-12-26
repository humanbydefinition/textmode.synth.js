import { ReflectionKind } from 'typedoc';
import { MemberRouter } from 'typedoc-plugin-markdown';

class FlattenedNamespacesRouter extends MemberRouter {
    getNamespaceDirectory(reflection) {
        if (this.isProjectNamespace(reflection)) {
            return this.buildNamespacePath(reflection);
        }
        return super.getNamespaceDirectory(reflection);
    }

    isProjectNamespace(reflection) {
        let ancestor = reflection.parent;
        while (ancestor && ancestor.kind === ReflectionKind.Namespace) {
            ancestor = ancestor.parent;
        }
        return ancestor?.kind === ReflectionKind.Project;
    }

    buildNamespacePath(reflection) {
        const stack = [];
        let current = reflection;
        while (current && current.kind === ReflectionKind.Namespace) {
            stack.unshift(current);
            current = current.parent;
        }

        const segments = [];
        for (const ns of stack) {
            segments.push(this.directories.get(ReflectionKind.Namespace), this.getReflectionAlias(ns));
        }

        return segments.join('/');
    }
}

export function load(app) {
    app.renderer.defineRouter('flattened-namespaces', FlattenedNamespacesRouter);
    app.logger.verbose('[typedoc] Registered flattened namespaces router');
}
