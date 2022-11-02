import { getConnection as getMongoDBConn } from "@models/mongodb/MongoDBConn";
import { CategoriesDao as CategoriesDaoMongoDB } from "@models/mongodb/CategoriesDao";
import { ICategories } from "@models/entities/Categories";

export class Categories{
    private dao: CategoriesDaoMongoDB;

    public constructor(typeConn:"MONGODB"){
        const getConnection = typeConn === "MONGODB" ? getMongoDBConn : null;
        const CategoriesDao = typeConn === "MONGODB" ? CategoriesDaoMongoDB : null;

        getConnection().then(conn=>{
            this.dao = new CategoriesDao(conn);
        }).catch(ex=>console.error(ex));
    }

    public getAllCategories(){
        return this.dao.getCategories();
    }

    public getCategoriesByIndex(index:string){
        return this.dao.getCategoriesById(index);
    }

    public getCategoriesByTitle(title:string){
        return this.dao.getCategoriesByTitle(title);
    }

    public getCategoriesStatus(status:'ACT'|'INA'){
        return this.dao.getCategoriesStatus(status)
    }

    public async addCategories(categories:ICategories){
        try{
            const {title, description} = categories;
            const category = await this.dao.getCategoriesByTitle(title);
            
            if(!category){
                return this.dao.insertCategories({
                    title,
                    description,
                    status: 'ACT' 
                }); 
            } 
            return false;           
        } catch(err){
            console.log("Error" , err);
            throw err;
        }
    }

    public async updateCategories(index:string, categories:ICategories){
        try{
            const {title, description:_description} = categories;
            const category = await this.dao.getCategoriesByTitle(title); //Pastelito encotrado
            
            if(!category){
                return this.dao.updateCategories({...categories, _id:index});
            }
            else if (category && category._id.toString() === index) {
                return this.dao.updateCategories({...categories, _id:index});
            }
            return false;   
        }catch(err){
            console.log("Error" , err);
            throw err;
        }
    }
    
    public async deleteCategories(index:string){
        const {title, description} = await this.dao.getCategoriesById(index);
        return this.dao.deleteCategories({
            title,
            description,
            status: "INA",
            _id:index
        })
    }

}


