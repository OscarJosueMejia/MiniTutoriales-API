import {Router} from 'express';
import { Tutorial } from '@libs/Tutorial';
import { ITutorial, ITutorialComment } from '@models/entities/Tutorial';
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

router.get('/all', async (_req, res)=>{
  try {
    const tutorialsList = await tutorialInstance.getTutorials();
    res.json(tutorialsList);

  } catch (ex) {
    console.error(ex);
    res.status(503).json({error:ex});
  }
});

router.get('/logged_user/:userId', async (req, res)=>{
  try {
    const {userId} = req.params;
    const tutorialsList = await tutorialInstance.getTutorialsForUser(userId);
    res.json(tutorialsList);

  } catch (ex) {
    console.error(ex);
    res.status(503).json({error:ex});
  }
});

router.get('/list/:userId', async (req, res)=>{
  try {
    const { userId } = req.params;
    console.log(userId);
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
    const { steps, tags, ...updateTutorial } = req.body as unknown as ITutorial;
    
    if (steps.length > 0 && tags.length > 0) {
      await tutorialInstance.updateTutorial({...{_id:id}, ...updateTutorial});
      res.status(200).json({"msg":"Registro Actualizado."});
    }
    else{
      res.status(500).json({error: "'Steps' and 'Tags' length must be greater than 0"});
    }

  } catch (error) {
    res.status(500).json({error: (error as Error).message});
  }
});

router.delete('/delete/:id', async(req, res)=>{
  try {
    const { id } = req.params; 
    await tutorialInstance.deleteTutorial(id as string);
    res.status(200).json({"msg": "Minitutorial Eliminado"})
  } catch (error) {
    res.status(500).json({error: (error as Error).message});
  }
});
router.put('/comment/:id', async (req, res)=>{
  try {
    const { id } = req.params;
    const commentBody = req.body as unknown as ITutorialComment;
      
    await tutorialInstance.addComment(id, commentBody);
      res.status(200).json({"msg":"Comentario Agregado.", commentBody});

  } catch (error) {
    res.status(500).json({error: (error as Error).message});
  }
});

router.put('/comment/remove/:id/:commentId', async (req, res)=>{
  try {
    const { id, commentId } = req.params;
      
    await tutorialInstance.removeComment(id, commentId);
      res.status(200).json({"msg":"Comentario Eliminado."});

  } catch (error) {
    res.status(500).json({error: (error as Error).message});
  }
});

router.put('/reaction/:id', async (req, res)=>{
  try {
    const { id } = req.params;
    const reactionInfo = req.body as unknown as {reactionName:"LIKE"|"DISLIKE", userId: string, mode: "ADD"|"REMOVE"};
    
    const result = await tutorialInstance.reactionHandler(id, reactionInfo);
    
    if (!result) {
      res.status(406).json({"error":"Interaction Already Registered or Nothing to remove."});
    }else{
      res.status(200).json({"msg":"Interacción Registrada."});
    }
  } catch (error) {
    res.status(500).json({error: (error as Error).message});
  }
});
  


export default router;