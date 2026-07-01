import { createReleaseConfig } from '@textmode/release-config';

export default createReleaseConfig({
	githubAssets: ['dist/textmode.synth.esm.js', 'dist/textmode.synth.umd.js'],
});
