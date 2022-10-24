import {Router} from 'express';
import TutorialRouter from './Tutorials';

const router  = Router();

router.use('/tutorial',TutorialRouter);

export default router;
