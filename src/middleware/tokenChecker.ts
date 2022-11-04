import jwt from 'jsonwebtoken';
const defaultSecret = process.env.ACCESS_TOKEN_SECRET;

export const verifyToken = (req,res,next)=>{
    const token =(req.get("Authorization")||req.get("authorization")||"").replace("Bearer ", "");
    if(token){
        // verifies secret and checks exp
        try {
            jwt.verify(token, defaultSecret);
            next();
        } catch (error) {
            console.log(error);
            return res.status(401).json({"error": true, "message": 'Unauthorized access.' });
        }
        
    } else {
        // if there is no token
        // return an error
        return res.status(403).send({
            "error": true,
            "message": 'No token provided.'
        });
      }
}