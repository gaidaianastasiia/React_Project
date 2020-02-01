import * as jwt from "jsonwebtoken";
import {USER_ROLES} from "../constants/userRoles";
import {authErrors, INTERNAL_SERVER_ERROR, profileErrors} from "../constants/apiErrors";

const FakeAPI = (() => {
    const TOKEN_SECRET_KEY = "qwerty";

    let users = [
        {
            email: "admin@email.com",
            password: "123456",
            role: USER_ROLES.admin
        },
        {
            email: "user@email.com",
            password: "123456",
            role: USER_ROLES.user
        }
    ];

    //let news = [];

    // let events = [];

    /************************** Публичные методы **********************************/

        //----------------Публичные методы Auth раздела---------------
    const authSignup = newUser => {
            return _processApiCall((resolve, reject) => {
                newUser.role = USER_ROLES.user;

                let isUserExist = _getExistingUser(newUser.email);

                if (isUserExist) {
                    return reject(authErrors.USER_EXIST);
                }

                users.push(newUser);
                const token = _generateToken(newUser);
                return resolve(token);
            });
        };

    const authSignin = user => {
        return _processApiCall((resolve, reject) => {
            const existingUser = _getExistingUser(user.email);

            if (existingUser && existingUser.password === user.password) {
                const token = _generateToken(existingUser);
                return resolve(token);
            }

            return reject(authErrors.WRONG_EMAIL_OR_PASSWORD);
        });
    };

    const isAuthenticated = token => {
        return _processApiCall((resolve, reject) => {
            if (!token) {
                return reject(authErrors.INVALID_TOKEN);
            }

            let decodedObj = _decodeToken(token);
            let user = _getExistingUser(decodedObj.email);

            if (user) {
                return resolve(user);
            } else {
                return reject(authErrors.INVALID_TOKEN);
            }
        });
    };

    //----------------Публичные методы News раздела-----------------

    //----------------Публичные методы Events раздела---------------

    //----------------Публичные методы Profile раздела--------------

    const updateUserData = (token, updatedData) => {
        return _processApiCall((resolve, reject) => {
            const isTokenValid = _checkIsTokenValid(token);

            if (isTokenValid) {
                users.forEach((user, index) => {
                    if (user.email === updatedData.email) {
                        updatedData.password = user.password;
                        users.splice(index, 1, updatedData);
                        const token = _generateToken(updatedData);
                        return resolve(token);
                    }
                });
            }

            return reject(authErrors.INVALID_TOKEN);
        });
    };

    const changePassword = (token, prevPass, newPass) => {
        return _processApiCall((resolve, reject) => {
            const currentUser = _decodeToken(token);

            if (currentUser) {
                users.forEach((user, index) => {
                    if (currentUser.email === user.email && prevPass === user.password) {
                        user.password = newPass;
                        return resolve();
                    }
                });

                return reject(profileErrors.PREV_PASS_INVALID);
            }

            return reject(authErrors.INVALID_TOKEN);
        });
    };

    /********************* Приватные методы ***********************************/

        //---------Общие приватные методы---------------

    const _processApiCall = call => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (_isRequestFailed()) {
                        return reject(INTERNAL_SERVER_ERROR);
                    }

                    return call(resolve, reject);
                }, 1000);
            });
        };

    const _isRequestFailed = () => {
        return Math.random() > 0.9;
    };

    const _checkIsTokenValid = token => {
        return _decodeToken(token) !== undefined;
    };

    const _decodeToken = token => {
        try {
            return jwt.verify(token, TOKEN_SECRET_KEY);
        } catch (err) {
            console.error(err);
        }
    };

    //-------------Приватные методы Auth раздела-----------------
    const _generateToken = userDataObj => {
        let objForToken = {...userDataObj};
        delete objForToken.password;
        return jwt.sign(objForToken, TOKEN_SECRET_KEY);
    };

    const _getExistingUser = email => {
        let existingUser = null;

        users.forEach(user => {
            if (user.email === email) {
                existingUser = user;
            }
        });

        return existingUser;
    };

    return {
        isAuthenticated,
        authSignup,
        authSignin,
        updateUserData,
        changePassword
    };
})();

export default FakeAPI;
