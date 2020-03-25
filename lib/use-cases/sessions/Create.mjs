import jwt          from 'jsonwebtoken';
import {
    Exception as X
} from '../../../packages.mjs';

import Base  from '../Base.mjs';
import { dumpUser } from '../../utils/dumps.mjs';
import config       from '../../config.mjs';
import User         from '../../domain-model/User.mjs';

export default class SessionsCreate extends Base {
    static validationRules = {
        data : [ 'required', { 'nested_object' : {
            password : [ 'required', 'string' ],
            email    : [ 'required', 'email' ]
        } } ]
    };

    async execute({ data }) {
        const existingUser = await User.findOne({ where: { email: data.email } });

        if (!existingUser || !await existingUser.checkPassword(data.password)) {
            throw new X({
                code   : 'AUTHENTICATION_FAILED',
                fields : {
                    email    : 'INVALID',
                    password : 'INVALID'
                }
            });
        }

        if (existingUser.status !== 'ACTIVE') {
            throw new X({
                code   : 'AUTHENTICATION_FAILED',
                fields : {
                    status : 'NOT_ACTIVE_USER'
                }
            });
        }

        return {
            data : {
                jwt : jwt.sign(dumpUser(existingUser), config.secret)
            }
        };
    }
}
