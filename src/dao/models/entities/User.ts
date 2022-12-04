export interface IUser {
    name:string,
    email: string,
    status: string, //'ACT' | 'INA' | 'BLQ';
    password?: string,
    preferences?: string[],
    oldPasswords?: string[],
    passwordChangeToken?: String,
    verificationPin?:string;
    created: Date,
    updated: Date,
    avatar?: string | number,
    failedAttempts?: number,
    lastLogin?: Date,
    rol:string,
    _id?: unknown
  }