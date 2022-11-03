import { ICategories } from "../entities/Categories";
import { AbstractDao } from "./AbstractDao";
import { Db } from "mongodb";

export class CategoriesDao extends AbstractDao<ICategories>{
    public constructor(db: Db) {
        super('categories', db );
      }
    
    public async insertCategories(newCategories: ICategories){
        try {
            const {_id, ...newObject} = newCategories;
            const result = await super.createOne(newObject);
            return result;
          } catch( ex: unknown) {
            console.log("CategoriesDao mongodb:", (ex as Error).message);
            throw ex;
          }
    }

    public async updateCategories(updateCategories: ICategories){
        try {
            const {_id, ...updateObject} = updateCategories;
            const result = await super.update(_id as string, updateObject);
            return result;
          } catch( ex: unknown) {
            console.log("CategoriesDao mongodb:", (ex as Error).message);
            throw ex;
          }
    }

    public async deleteCategories(deleteCategories: ICategories){
        try {
            const {_id, ...updateObject} = deleteCategories;
            const result = await super.update(_id as string, updateObject);
            return result;
          } catch( ex: unknown) {
            console.log("CategoriesDao mongodb:", (ex as Error).message);
            throw ex;
          }
    }

    public getCategories(){
        return super.findAll()
    }

    public async getCategoriesByTitle(title:string){
      try{
        return await super.findOneByFilter({title});
      } catch(ex: unknown) {
        console.log("CategoriesDao mongodb:", (ex as Error).message);
        throw ex;
      }
    }

    public async getCategoriesById(identifier:string){
        try{
            const result = await super.findByID(identifier);
            return result;
          } catch( ex: unknown) {
            console.log("CategoriesDao mongodb:", (ex as Error).message);
            throw ex;
          }
    }

    public getCategoriesStatus(status:'ACT'|'INA'){
      const query = {status};
      return this.findByFilter(query);
    }
}