import { MarkdownTheme, MarkdownThemeContext } from 'typedoc-plugin-markdown';
import { i18n, ReflectionKind } from 'typedoc';

function heading(level, text) {
	return `${'#'.repeat(level)} ${text}`;
}

function renderAccessorSignature(context, signature, options) {
	const md = [];

	md.push(heading(options.headingLevel, options.title));
	md.push(
		context.partials.signatureTitle(signature, {
			accessor: options.accessor,
		})
	);

	if (options.showSources && !context.options.getValue('disableSources') && signature.sources) {
		md.push(context.partials.sources(signature));
	}

	if (signature.comment) {
		md.push(
			context.partials.comment(signature.comment, {
				headingLevel: options.headingLevel + 1,
				showTags: false,
				showSummary: true,
			})
		);
	}

	if (options.includeParameters && signature.parameters?.length) {
		md.push(heading(options.headingLevel + 1, ReflectionKind.pluralString(ReflectionKind.Parameter)));
		if (context.helpers.useTableFormat('parameters')) {
			md.push(context.partials.parametersTable(signature.parameters));
		} else {
			md.push(
				context.partials.parametersList(signature.parameters, {
					headingLevel: options.headingLevel + 1,
				})
			);
		}
	}

	if (signature.type) {
		md.push(
			context.partials.signatureReturns(signature, {
				headingLevel: options.headingLevel + 1,
			})
		);
	}

	if (signature.comment) {
		md.push(
			context.partials.comment(signature.comment, {
				headingLevel: options.headingLevel + 1,
				showTags: true,
				showSummary: false,
			})
		);
	}

	return md.filter(Boolean).join('\n\n');
}

export function renderAccessorMember(context, model, options) {
	const md = [];
	const showSources = model?.parent?.kind !== ReflectionKind.TypeLiteral;

	if (model.getSignature) {
		md.push(
			renderAccessorSignature(context, model.getSignature, {
				accessor: 'get',
				headingLevel: options.headingLevel,
				includeParameters: false,
				showSources,
				title: i18n.kind_get_signature(),
			})
		);
	}

	if (model.setSignature) {
		md.push(
			renderAccessorSignature(context, model.setSignature, {
				accessor: 'set',
				headingLevel: options.headingLevel,
				includeParameters: true,
				showSources,
				title: i18n.kind_set_signature(),
			})
		);
	}

	if (showSources && !context.options.getValue('disableSources')) {
		if (!model.getSignature && !model.setSignature) {
			md.push(context.partials.sources(model));
		}
	}

	if (model.comment) {
		md.push(
			context.partials.comment(model.comment, {
				headingLevel: options.headingLevel,
			})
		);
	}

	md.push(context.partials.inheritance(model, { headingLevel: options.headingLevel }));

	return md.filter(Boolean).join('\n\n');
}

class AccessorOrderMarkdownThemeContext extends MarkdownThemeContext {
	constructor(theme, page, options) {
		super(theme, page, options);
		this.partials.accessor = (model, partialOptions) => renderAccessorMember(this, model, partialOptions);
	}
}

let isPatched = false;

export function load(app) {
	if (!isPatched) {
		MarkdownTheme.prototype.getRenderContext = function (page) {
			return new AccessorOrderMarkdownThemeContext(this, page, this.application.options);
		};
		isPatched = true;
	}

	app.logger.verbose('[typedoc] Registered accessor signature ordering theme override');
}
