import { Router } from "express";
import { sign, refresh } from "@server/utils/jwt";
import { verifyToken } from "@server/middleware/tokenChecker";

const router = Router();

router.post('/login', async (req, res) => {
    const authObject = (sign(req.body));
    res.cookie('jwt',authObject.token,{ httpOnly:true,
        sameSite: "none", secure: false,
        maxAge: 24 * 60 * 60 * 1000
    });
    res.status(200).json(authObject);
});

router.post('/validate',verifyToken);

router.get('/', (req,res)=>{
    console.log(req.cookies.jwt);
    let response = {"hola":"hola"};
    const token = refresh(req);
    res.status(200).json({...response, ...token});
})

export default router;