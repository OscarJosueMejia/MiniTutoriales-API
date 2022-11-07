import { Router } from 'express';
import TutorialRouter from './Tutorials';

import CategoriesRouter from './Categories';
import UsersRouter from './Users';

const router = Router();

router.use('/tutorial', TutorialRouter);
router.use('/category', CategoriesRouter);
router.use('/user', UsersRouter);

export default router;
