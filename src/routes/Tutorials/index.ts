import {Router} from 'express';
import { Tutorial } from '@libs/Tutorial';
import { Users } from '@libs/Users';
import { ITutorial, ITutorialComment } from '@models/entities/Tutorial';
// import { commonValidator, validateInput } from '@server/utils/validator';
const router = Router();
const users = new Users();
const tutorialInstance = new Tutorial("MONGODB");

router.get('/one/:id', async (req, res)=>{
  try {
    const { id } = req.params;
    const { userId } = req.query;
    const tutorialDetails = await tutorialInstance.getTutorialById(id, userId as string);
    res.json(tutorialDetails[0]);

  } catch (ex) {
    console.error(ex);
    res.status(503).json({error:ex});
  }
});

router.get('/all', async (req, res)=>{
  try {
    const {page, items} = {page:"1", items:"10", ...req.query};
    const tutorialsList = await tutorialInstance.getTutorials(Number(page), Number(items));
    res.json(tutorialsList);

  } catch (ex) {
    console.error(ex);
    res.status(503).json({error:ex});
  }
});

router.get('/logged_user/:userId', async (req, res)=>{
  try {
    const {userId} = req.params;
    const {page, items} = {page:"1", items:"10", ...req.query};
    const tutorialsList = await tutorialInstance.getTutorialsForUser(userId, Number(page), Number(items));
    res.json(tutorialsList);

  } catch (ex) {
    console.error(ex);
    res.status(503).json({error:ex});
  }
});

router.get('/list/:userId/:mode/:currentUser', async (req, res)=>{
  try {
    const { userId, mode, currentUser} = req.params;
    const {page, items } = {page:"1", items:"10", ...req.query};
    
    let tutorialList;
    
    if (mode !== undefined && mode === "LIKED") {
      tutorialList = await tutorialInstance.getTutorialsLikedByUser(userId, Number(page), Number(items));
    }else{
      tutorialList = await tutorialInstance.getTutorialsByUser(userId, Number(page), Number(items), currentUser);
    }
    const {avatar, name, email, _id} = await users.getUsersById(userId);

    res.json({...tutorialList, ...{userData:{avatar, name, email, _id}}});

  } catch (ex) {
    console.error(ex);
    res.status(503).json({error:ex});
  }
});

router.get('/byCategory/:categoryId/:userId', async (req, res)=>{
  try {
    const { categoryId, userId } = req.params;
    const { page, items } = {page:"1", items:"10", ...req.query};
    
    const tutorialList = await tutorialInstance.getTutorialsByCategory(categoryId, userId, Number(page), Number(items));
    res.json(tutorialList);

  } catch (ex) {
    console.error(ex);
    res.status(503).json({error:ex});
  }
});


router.get('/custom', async (req, res)=>{
  try {
    const { userId, search } = req.query;
    const tutorialList = await tutorialInstance.customSearch(search.toString(), userId.toString());
    
    res.json(tutorialList);

  } catch (ex) {
    console.error(ex);
    res.status(503).json({error:ex});
  }
});

router.post('/add/:userId', async (req, res)=>{
  try {
    const { userId } = req.params;
    const { steps, tags, ...insertObject } = req.body as unknown as ITutorial;
    const categoryIdV = insertObject.categoryId as string;

    //Check if user id exists.

    if (categoryIdV.length === 0 || insertObject.description.length === 0 || insertObject.requirements.length === 0 || insertObject.title.length === 0) {
      res.status(500).json({error: "'Complete all the fields'"});
    } else {
      if (steps.length > 0 && tags.length > 0) {
      
        const newTutorialIndex = await tutorialInstance.addTutorial(userId as string, {...{steps}, ...{tags}, ...insertObject});
        res.status(200).json({newIndex: newTutorialIndex});
      }else{
        res.status(500).json({error: "'Steps' and 'Tags' length must be greater than 0"});
      }
    }

  } catch (error) {
    res.status(500).json({error: (error as Error).message});
  }
});

router.put('/update/:id', async (req, res)=>{
  try {
    const { id } = req.params;
    const {steps, tags, ...updateTutorial } = req.body as unknown as ITutorial;
    // const categoryIdV = updateTutorial.categoryId as string;
    
    // if (categoryIdV.length === 0 || updateTutorial.description.length === 0 || updateTutorial.requirements.length === 0 || updateTutorial.title.length === 0) {
    if (updateTutorial.description.length === 0 || updateTutorial.requirements.length === 0 || updateTutorial.title.length === 0) {
      res.status(500).json({error: "'Complete all the fields'"});
    } else {
      if (steps.length > 0 && tags.length > 0) {
        await tutorialInstance.updateTutorial({...{_id:id}, steps, tags, ...updateTutorial});
        res.status(200).json({"msg":"Registro Actualizado."});
      }
      else{
        res.status(500).json({error: "'Steps' and 'Tags' length must be greater than 0"});
      } 
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
    const {authorName, userId, text} = req.body as unknown as ITutorialComment;
    
    const result = await tutorialInstance.addComment(id, {authorName, userId, text});
    res.status(200).json({"msg":"Comentario Agregado.", newId:result.newId});

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
      res.status(200).json({"msg":"Interacción Registrada"});
    }
  } catch (error) {
    res.status(500).json({error: (error as Error).message});
  }
});
  


export default router;