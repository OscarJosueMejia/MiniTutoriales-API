import jwt from 'jsonwebtoken';
const defaultSecret = process.env.JWT_SECRET;

export const sign = (payload, secret = defaultSecret) => {
    return jwt.sign(payload, secret, {expiresIn:'24H'});
}

export const signOptions = (payload, options, secret = defaultSecret) => {
    return jwt.sign(payload, secret, options);
}

export const verify = (token, secret = defaultSecret) => {
    return jwt.verify(token, secret);
}