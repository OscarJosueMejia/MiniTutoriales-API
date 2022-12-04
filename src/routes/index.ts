import { Router } from 'express';
import TutorialRouter from './Tutorials';

import CategoriesRouter from './Categories';
import apiKeyMW from '@middleware/apiKeyHeaderValidator';
import { jwtValidator } from '@server/middleware/jwtBearerValidator';
import UsersRouter from './Users';

const router = Router();

router.use('/tutorial',apiKeyMW, jwtValidator, TutorialRouter);
router.use('/category', CategoriesRouter);
router.use('/user',apiKeyMW, UsersRouter);

export default router;
