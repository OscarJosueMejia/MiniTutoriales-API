import { getConnection as getMongoDBConn } from "@models/mongodb/MongoDBConn";
import { TutorialDao as TutorialDaoMongoDB} from "@models/mongodb/TutorialDao";
import { ITutorial } from "@models/entities/Tutorial";

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

    public getTutorialById(identifier:string){
        return this.dao.getTutorialById(identifier);
    }

    public getTutorialsByUser(index:string){
        return this.dao.getTutorialsByUser(index);
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
                tags,
                reactionsCount:{reaction1:0, reaction2:0},
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
}
