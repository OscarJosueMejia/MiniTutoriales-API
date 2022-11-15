import { Router } from 'express';

import outlookAuth from './OutlookAuth';
import TutorialRouter from './Tutorials';

import CategoriesRouter from './Categories';
import { jwtValidator } from '@server/middleware/jwtBearerValidator';
import UsersRouter from './Users';

const router = Router();

router.use('/auth', outlookAuth);
router.use('/tutorial', TutorialRouter);
router.use('/category', jwtValidator, CategoriesRouter);
router.use('/user', UsersRouter);

export default router;
