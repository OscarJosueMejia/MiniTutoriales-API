import { ITutorial } from "../entities/Tutorial";
import { AbstractDao } from "./AbstractDao";
import { Db } from "mongodb";



export class TutorialDao extends AbstractDao<ITutorial>{
    public constructor(db:Db) {
        super('Tutorial', db);
    }

    /**
     * @param identifier 
     * @description Retorna los detalles de un tutorial.
     * @returns array<ITutorial>
     */
    public async getTutorialById(_identifier:string){
        try {
            const result1 = super.getCollection().aggregate([{
                $lookup:{
                    from:'User',
                    localField:'authorId',
                    foreignField:'_id',
                    as:'autor_info'
                }
            }])
            // const result = await super.findByID(identifier);
            return result1;
        } catch (ex:unknown) {
            console.log("TutorialDao mongodb:", (ex as Error).message);
            throw ex;
        }
    }

    /**
     * @param identifier 
     * @description Retorna los tutoriales pertenecientes a un usuario.
     * @returns array<ITutorial>
     */
    public async getTutorialsByUser(identifier:string){
        try {
            const result = await super.findByFilter({authorId:identifier});
            return result;
        } catch (ex:unknown) {
            console.log("TutorialDao mongodb:", (ex as Error).message);
            throw ex;
        }
    }

    /**
     * @param newTutorial 
     * @description Inserta un nuevo Tutorial en la coleccion de Tutoriales.
     * @returns boolean
     */
    public async insertNewTutorial(newTutorial: ITutorial) {
        try {
            const {_id, ...newObject} = newTutorial;
            // const result = await super.updateRaw(userIdentifier, {"$push":{ "tutorials":{...{_id: new ObjectId()},...newObject}}});
            const result = await super.createOne(newObject);
            return result;
        } catch (ex:unknown) {
            console.log("TutorialDao mongodb:", (ex as Error).message);
            throw ex;
        }
    }

    public async updateTutorial(updateTutorial: Partial<ITutorial>){
        try {
            const {_id, ...updateObject} = updateTutorial;
            const result = await super.update(_id as string, updateObject);
            return result;

        } catch (ex:unknown) {
            console.log("TutorialDao mongodb:", (ex as Error).message);
            throw ex;
        }
    }

}