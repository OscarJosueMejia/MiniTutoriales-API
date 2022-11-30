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
    avatar?: string,
    failedAttempts?: number,
    lastLogin?: Date,
    roles:string[],
    _id?: unknown
  }