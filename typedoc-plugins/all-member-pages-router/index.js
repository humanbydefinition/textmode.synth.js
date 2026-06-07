// @ts-check

import { ROUTER_NAME } from './constants.js';
import { AllMemberPagesRouter } from './router.js';

/**
 * TypeDoc plugin load function.
 *
 * @param {import('typedoc').Application} app
 * @returns {void}
 */
export function load(app) {
	app.renderer.defineRouter(ROUTER_NAME, AllMemberPagesRouter);
	app.logger.verbose('[typedoc] Registered all member pages router');
}
