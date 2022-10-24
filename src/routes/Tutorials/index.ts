import {Router} from 'express';
import { Tutorial } from '@libs/Tutorial';
import { ITutorial } from '@models/entities/Tutorial';
// import { commonValidator, validateInput } from '@server/utils/validator';
const router = Router();
const tutorialInstance = new Tutorial("MONGODB");

router.get('/one/:id', async (req, res)=>{
  try {
    const { id } = req.params;
    const tutorialDetails = await tutorialInstance.getTutorialById(id);
    res.json(tutorialDetails);

  } catch (ex) {
    console.error(ex);
    res.status(503).json({error:ex});
  }
});

router.get('/list/:userId', async (req, res)=>{
  try {
    const { userId } = req.params;
    const tutorialList = await tutorialInstance.getTutorialsByUser(userId);
    res.json(tutorialList);

  } catch (ex) {
    console.error(ex);
    res.status(503).json({error:ex});
  }
});

router.put('/add/:userId', async (req, res)=>{
  try {
    const { userId } = req.params;
    const { steps, tags, ...insertObject } = req.body as unknown as ITutorial;
    
    //Check if user id exists.

    if (steps.length > 0 && tags.length > 0) {
  
      const newTutorialIndex = await tutorialInstance.addTutorial(userId as string, {...{steps}, ...{tags}, ...insertObject});
      res.status(200).json({newIndex: newTutorialIndex});
    }else{
      res.status(500).json({error: "'Steps' and 'Tags' length must be greater than 0"});
    }

  } catch (error) {
    res.status(500).json({error: (error as Error).message});
  }
});

router.put('/update/:id', async (req, res)=>{
  try {
    const { id } = req.params;
    
    const updateTutorial = req.body as unknown as ITutorial;
      await tutorialInstance.updateTutorial({...{_id:id}, ...updateTutorial});
      res.status(200).json({"msg":"Registro Actualizado."});

  } catch (error) {
    res.status(500).json({error: (error as Error).message});
  }
});


export default router;