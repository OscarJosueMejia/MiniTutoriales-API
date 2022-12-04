import { getConnection as getMongoDBConn } from "@models/mongodb/MongoDBConn";
import { TutorialDao as TutorialDaoMongoDB} from "@models/mongodb/TutorialDao";
import { ITutorial, ITutorialComment } from "@models/entities/Tutorial";

export class Tutorial {
    private dao: TutorialDaoMongoDB;
    public constructor(typeConn:"MONGODB"){
        const getConnection = typeConn === "MONGODB" ? getMongoDBConn : null;
        const TutorialDao = typeConn === "MONGODB" ? TutorialDaoMongoDB : null;

        getConnection().then(conn=>{
            this.dao = new TutorialDao(conn);
        })
        .catch(ex=>console.error(ex));
    }

    public getTutorials(page:number, items:number){
        return this.dao.getTutorials(page, items);
    }

    public getTutorialsForUser(identifier:string, page:number, items:number){
        return this.dao.getTutorialsForUser(identifier, page, items);
    }
    
    public getTutorialById(identifier:string, userId?:string){
        return this.dao.getTutorialById(identifier, userId);
    }

    public getTutorialsByUser(identifier:string, page:number, items:number, currentUser?:string){
        return this.dao.getTutorialsByUser(identifier, page, items, currentUser);
    }

    public getTutorialsLikedByUser(identifier:string, page:number, items:number){
        return this.dao.getTutorialsLikedByUser(identifier, page, items);
    }

    public getTutorialsByCategory(categoryId:string, identifier:string, page:number, items:number){
        return this.dao.getTutorialsByCategory(categoryId, identifier, page, items);
    }

    public customSearch(search:string, identifier:string){
        return this.dao.customSearch(search, identifier);
    }

    public addTutorial(authorId:string, newTutorial: Partial<ITutorial>) {
        const { title, description, requirements, steps, tags } = newTutorial;
        return this.dao.insertNewTutorial(
            {
                authorId,
                title,
                description,
                requirements,
                comments:[],
                steps,
                reactionsCount:{reaction_IsUtil:[], reaction_Dislike:[]},
                tags,
                createdAt: new Date()
            }
        );
      }

    public updateTutorial(updateTutorial: Partial<ITutorial>) {
        const {_id, title, description, requirements, steps, tags} = updateTutorial;
        return this.dao.updateTutorial(
            {
                _id,
                title,
                description,
                requirements,
                steps,
                tags,
            }
        );
      }
    
    /**
     * deleteTutorial
     */
    public deleteTutorial(index: string) {
        return this.dao.deleteTutorial(index as string);
    }

    public addComment(tutorialId: string,  newComment : ITutorialComment) {
        return this.dao.addComment(tutorialId, newComment);
    }

    public removeComment(tutorialId: string,  commentId : string) {
        return this.dao.deleteComment(tutorialId, {_id:commentId});
    }

    public reactionHandler(tutorialId: string,  reactionInfo: {reactionName:"LIKE"|"DISLIKE", userId: string, mode: "ADD"|"REMOVE"}) {
        return this.dao.reactionHandler(tutorialId, reactionInfo);
      }
}
