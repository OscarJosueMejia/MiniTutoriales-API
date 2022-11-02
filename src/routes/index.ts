import {Router} from 'express';

import  CategoriesRouter from './Categories';
const router  = Router();

router.use('/category', CategoriesRouter);

export default router;
