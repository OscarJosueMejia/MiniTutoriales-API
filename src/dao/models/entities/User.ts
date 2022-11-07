export interface IUser {
    username: string,
    email: string,
    status: string, //'ACT' | 'INA' | 'BLQ';
    password?: string,
    preferences?: string[],
    oldPasswords?: string[],
    passwordChangeToken?: String,
    created: Date,
    updated: Date,
    avatar?: string,
    failedAttempts?: number,
    lastLogin?: Date,
    roles:string[],
    _id?: unknown
  }