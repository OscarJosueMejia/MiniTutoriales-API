import {Router} from 'express';

import  CategoriesRouter from './Categories';
import AuthTest from './authTest';
const router  = Router();

router.use('/category', CategoriesRouter);
router.use('/token', AuthTest);
export default router;
