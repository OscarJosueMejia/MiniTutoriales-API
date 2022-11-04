import jwt from "jsonwebtoken";

const defaultSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const tokenLife = process.env.TOKEN_LIFE;
const tokenRefreshLife = process.env.REFRESH_TOKEN_LIFE;
const tokenList = {};

export const sign =(payload) =>{
    console.log(payload);
    const token = jwt.sign(payload, defaultSecret, { expiresIn: tokenLife})
    const refreshToken = jwt.sign(payload, refreshTokenSecret, { expiresIn: tokenRefreshLife})
    tokenList[refreshToken] = {
        "token": token,
        "refreshToken": refreshToken,
    };
    return {
        "status": "Logged in",
        "token": token,
        "refreshToken": refreshToken,
    };
};

export const refresh = (payload) =>{
    console.log(payload.cookies);
    if(payload.cookies?.jwt) {
        const refreshToken = payload.cookies.jwt;
        console.log(refreshToken);
        const user = {
            "email": payload.email,
            "name": payload.name
        }
        try {
            jwt.verify(refreshToken, refreshTokenSecret);
            const token = jwt.sign(user, defaultSecret, { expiresIn: tokenLife})
            const response = {
                "token": token,
            }
        return response;        

        } catch (error) {
            console.log(error);
            return false;
        }
    } else {
        return false;
    }
}

