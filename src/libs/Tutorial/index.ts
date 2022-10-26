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

    public getTutorials(){
        return this.dao.getTutorials();
    }

    public getTutorialsForUser(identifier:string){
        return this.dao.getTutorialsForUser(identifier);
    }
    
    public getTutorialById(identifier:string){
        return this.dao.getTutorialById(identifier);
    }

    public getTutorialsByUser(identifier:string){
        return this.dao.getTutorialsByUser(identifier);
    }

    public addTutorial(authorId:string, newTutorial: Partial<ITutorial>) {
        const {title, description, requirements, steps, tags, createdAt} = newTutorial;
        return this.dao.insertNewTutorial(
            {
                authorId,
                title,
                description,
                requirements,
                steps,
                reactionsCount:{reaction_IsUtil:[], reaction_Dislike:[]},
                tags,
                createdAt: new Date(createdAt)
            }
        );
      }

    public updateTutorial(updateTutorial: Partial<ITutorial>) {
        const {_id, authorId, title, description, requirements, steps, tags, reactionsCount} = updateTutorial;
        return this.dao.updateTutorial(
            {
                _id,
                authorId,
                title,
                description,
                requirements,
                reactionsCount,
                steps,
                tags,
            }
        );
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
