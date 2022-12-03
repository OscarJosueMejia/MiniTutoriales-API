import { IUser } from "../entities/User";
import { AbstractDao } from "./AbstractDao";
import {Db} from "mongodb";

export class UsersDao extends AbstractDao<IUser>{
  public constructor(db: Db) {
    super('users', db );
  }

  public async getAllUsers(page:number = 1, itemsPerPage: number = 10){
    try {
      const total = await super.getCollection().countDocuments();
      const totalPages = Math.ceil(total/itemsPerPage);
      
      const items = await super.aggregate([
        { $project:{verificationPin:0, oldPasswords:0, failedAttempts:0, password:0, avatar:0, created:0}},
        { $skip:((page-1) * itemsPerPage) },
        { $limit: itemsPerPage }
      ],{});

      return { total, totalPages, page, itemsPerPage, items };

    } catch( ex: unknown) {
      console.log("UsersDao mongodb:", (ex as Error).message);
      throw ex;
    }
  }
  
  public getUserByEmail(email:string){
    const query = {email};
    return this.findOneByFilter(query);
  }

  public createUser(user:IUser){
    const {_id, ...newUser} = user;
    return this.createOne(newUser);
  }

  public updateUserStatus(id:string){
    return this.update(id, {updated: new Date()});
  }

  public async updateStatusUser(user: Partial<IUser>){
   try {
     const { _id, ...updateObject} = user;

     return await this.update(_id as string, updateObject);
    
   } catch( ex: unknown) {
     console.log("UsersDao mongodb:", (ex as Error).message);
     throw ex;
   }
 }

 public getUserById(_id:string){
  return this.findByID(_id);
  }


  public updateUserFailed(id:string){
    return this.updateRaw(id, {$inc:{failedAttempts:1}, $set:{updated: new Date()}});
  }

  public updateLoginSuccess(id:string){
    const currentDate = new Date();
    return this.update(id, {lastLogin: currentDate, failedAttempts: 0, updated: currentDate})
  }

  public addRoleToUser(id:string, role:string){
    return this.updateRaw(id, 
        //{$push : {roles: role}}
        {$addToSet: {roles:role}}
      );
  }

  public async updateUser(user: Partial<IUser>){
    try {
      const {_id, ...updateObject} = user;

      return await this.update(_id as string, updateObject);
      
    } catch( ex: unknown) {
      console.log("UsersDao mongodb:", (ex as Error).message);
      throw ex;
    }
  }

  public async deleteRecoveryToken(user: Partial<IUser>){
    try {
      const {_id} = user; 
      return await this.updateRaw(_id as string, {"$unset":{"passwordChangeToken":""}})  
    } catch( ex: unknown) {
      console.log("UsersDao mongodb:", (ex as Error).message);
      throw ex;
    }
  }

//public async deleteUser(deleteUser: IUser){
//  try {
//      const {_id, ...updateObject} = deleteUser;
//      const result = await super.update(_id as string, updateObject);
//      return result;
//    } catch( ex: unknown) {
//      console.log("CategoriesDao mongodb:", (ex as Error).message);
//      throw ex;
//    }
//}
}