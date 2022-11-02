import { Router } from "express";
import { Categories } from "@server/libs/Categories";
import { ICategories } from "@server/dao/models/entities/Categories";

const router = Router();
const categoriesInstance = new Categories("MONGODB");

router.get('/all', async (_req, res)=>{
    try {
      res.json(await categoriesInstance.getAllCategories());
    } catch (ex) {
      console.error(ex);
      res.status(503).json({error:ex});
    }
  });

  router.get('/byindex/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const idC = (/^\d*$/.test(id))?+id:id;
      res.json(await categoriesInstance.getCategoriesByIndex(idC as string));
    } catch (error) {
      console.log("Error", error);
      res.status(500).json({'msg': 'Error al obtener Registro'});
    }
  });

  router.get('/all/:status', async (req, res)=>{
    try{
      const {status} = req.params;
      const result = await categoriesInstance.getCategoriesStatus(status as 'ACT'|'INA');
      res.status(200).json(result);
    } catch (error) {
      console.log("Error", error);
      res.status(500).json({'msg': 'Error al obtener Registro'});
    }
  });

  router.post('/add', async (req, res)=>{
    try {
      const newCategories = req.body as unknown as ICategories;
      const categoriesInfo = req.body as unknown as {title: string, description: string}
      const newCategoriesIndex = await categoriesInstance.addCategories(newCategories);
      
      if (categoriesInfo.title.length === 0){
        res.status(500).json({error: "'Title' length must be greater than 0"});
      } else if(categoriesInfo.description.length === 0){
        res.status(500).json({error: "'Description' length must be greater than 0"});
      } else{
        if(newCategoriesIndex){
          res.json({newIndex: newCategoriesIndex});
        }else{
          res.status(500).json({error: "'Title' invalid, already exists!"});
        };
      }
    } catch (error) {
      res.status(500).json({error: (error as Error).message});
    }
  });

  router.put('/update/:id', async (req, res)=>{
    try {
      const { id } = req.params;
      const categoriesInfo = req.body as unknown as {title: string, description: string}
      const categories = req.body as ICategories;
      const idC = (/^\d*$/.test(id))?+id:id;

      if (categoriesInfo.title.length === 0){
        res.status(500).json({error: "'Title' length must be greater than 0"});
      } else if(categoriesInfo.description.length === 0){
        res.status(500).json({error: "'Description' length must be greater than 0"});
      } else{
      const Update = await categoriesInstance.updateCategories(idC as string, categories);
        if(Update){
          res.status(200).json({"msg":"Registro Actualizado"});
        }else{
          res.status(500).json({error: "'Title' invalid, already exists!"});
        }
      }
    } catch(error){
      res.status(500).json({error: (error as Error).message});
    }
  });
  
  router.put('/delete/:id', async (req, res)=>{
    try {
      const { id } = req.params;
      const idC = (/^\d*$/.test(id))?+id:id;
      await categoriesInstance.deleteCategories(idC as string);
      res.status(200).json({"msg":"Registro Eliminado"});
    } catch(error) {
      res.status(500).json({error: (error as Error).message});
    }
  });
  
export default router;