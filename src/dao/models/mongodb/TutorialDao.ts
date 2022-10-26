import { ITutorial, ITutorialComment } from "../entities/Tutorial";
import { AbstractDao } from "./AbstractDao";
import { Db, ObjectId } from "mongodb";



export class TutorialDao extends AbstractDao<ITutorial>{
    public constructor(db:Db) {
        super('Tutorial', db);
    }

    public async getTutorials(){
        try {
            return await super.findAll();
        } catch (ex:unknown) {
            console.log("TutorialDao mongodb:", (ex as Error).message);
            throw ex;
        }
    }

    /**
     * @param identifier 
     * @description Retorna los detalles de un tutorial.
     * @returns array<ITutorial>
     */
    public async getTutorialById(_identifier:string){
        try {
            // const result1 = super.getCollection().aggregate([{
            //     $lookup:{
            //         from:'User',
            //         localField:'authorId',
            //         foreignField:'_id',
            //         as:'autor_info'
            //     }
            // }])
            // return await super.findByFilter(identifier);;
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
            const result = await super.findByFilter({authorId: new ObjectId(identifier)});
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

    public async addComment( tutorialId: string, newComment: ITutorialComment){
        try {
            const {userId, ...commentBody} = newComment;
            const result = await super.updateRaw(tutorialId as string, {"$push":{ "comments": 
            {...{
                    _id: new ObjectId(), 
                    userId: new ObjectId(userId as string)
                }, 
            ...commentBody}}});
            return result;
        } catch (ex:unknown) {
            console.log("TutorialDao mongodb:", (ex as Error).message);
            throw ex;
        }
    }

    public async deleteComment(tutorialId:string, commentId: Partial<ITutorialComment>, ){
        try {
            const {_id} = commentId;
            return await super.updateRaw(tutorialId as string, {"$pull":{'comments': {'_id': new ObjectId(_id as string)}}});
        
        } catch (ex:unknown) {
            console.log("TutorialDao mongodb:", (ex as Error).message);
            throw ex;
        }
    }

    public async reactionHandler( tutorialId: string, reactionInfo: {reactionName:"LIKE"|"DISLIKE", userId: string, mode: "ADD"|"REMOVE"}){
        try {
            const {reactionName, userId, mode} = reactionInfo;
            let registeredFilter: {};
            let updateFilter: {};

            switch (reactionName){
                case "LIKE":
                    registeredFilter = {'reactionsCount.reaction_IsUtil': {$in: [userId]}};
                    updateFilter = { "reactionsCount.reaction_IsUtil": userId};
                    break;
                case "DISLIKE":
                    registeredFilter = {'reactionsCount.reaction_Dislike': {$in: [userId]}};
                    updateFilter = { "reactionsCount.reaction_Dislike": userId};
                    break;
            }

            const checkRegistered = await super.findByFilter({$and:
                [{'_id': new ObjectId(tutorialId)},
                  registeredFilter]});

            switch (mode) {
                case "ADD":
                    if (checkRegistered.length === 0) {
                        return await super.updateRaw(tutorialId as string, {"$push":updateFilter})
                    }else{
                        console.log("Interaction Already Registered");
                        return false;
                    }
                case "REMOVE":
                    if (checkRegistered.length > 0) {
                        return await super.updateRaw(tutorialId as string, {"$pull":updateFilter})
                    }else{
                        console.log("No Interaction to Remove");
                        return false;
                    }
            }

        } catch (ex:unknown) {
            console.log("TutorialDao mongodb:", (ex as Error).message);
            throw ex;
        }
    }

}