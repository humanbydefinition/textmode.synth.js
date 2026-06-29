import { Application, PackageJsonReader, TSConfigReader } from 'typedoc';

export async function loadTypeDocProject({ entryPoint, tsconfig = 'tsconfig.json', errorMessage }) {
	const app = await Application.bootstrap(
		{
			entryPoints: [entryPoint],
			entryPointStrategy: 'resolve',
			tsconfig,
			excludeInternal: true,
			excludePrivate: true,
			excludeProtected: true,
			readme: 'none',
			emit: 'none',
			logLevel: 'Error',
		},
		[new PackageJsonReader(), new TSConfigReader()]
	);

	const project = await app.convert();
	if (!project || app.logger.hasErrors()) {
		throw new Error(errorMessage ?? `TypeDoc failed to resolve ${entryPoint}.`);
	}

	return project;
}
