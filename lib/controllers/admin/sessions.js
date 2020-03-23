import chista         from '../../chista.js';

import SessionsCreate from '../../services/admin/sessions/Create.js';
import SessionsCheck  from '../../services/admin/sessions/Check.js';

export default {
    create : chista.makeServiceRunner(SessionsCreate, req => req.body),

    async check(req, res, next) {
        const promise = chista.runService(SessionsCheck, {
            params : { token: req.headers.authorization }
        });

        try {
            const userData = await promise;

            /* eslint no-param-reassign: 0 */
            req.session = {
                context : {
                    userId : userData.id
                    // userStatus : userData.status
                }
            };

            return next();
        } catch (e) {
            return chista.renderPromiseAsJson(req, res, promise);
        }
    }
};