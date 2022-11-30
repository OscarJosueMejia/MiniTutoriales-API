import { verify } from '@utils/jwt';

export const jwtValidator = (req, res, next) => {
    try {
        const jwtToken = ( req.get('Authorization') || req.get('authorization') || '').replace("Bearer ", "")
        const decoded = verify(jwtToken);
        req.user = decoded;
        next();
    } catch (error) {
        console.log("JWT-MIDDLEWARE: ", error)
        res.status(403).json({error:"INVALID TOKEN"});

    }
}