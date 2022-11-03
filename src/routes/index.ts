import { Router } from 'express';
import TutorialRouter from './Tutorials';

import CategoriesRouter from './Categories';
const router = Router();

router.use('/tutorial', TutorialRouter);
router.use('/category', CategoriesRouter);

export default router;
