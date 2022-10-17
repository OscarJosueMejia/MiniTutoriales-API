export interface IValidationSchemaItem {
    param: string;
    type:any; 
    error:string; 
    required?:boolean;
    regex?:RegExp; 
    customValidate?: (value:any) => boolean;  
};


export const validateInput = (objectToValidate: any, validationSchema: IValidationSchemaItem[]
    ) => {
    const errors: {param:string, error:string, errorType: "INCORRECT_TYPE"|"REGEX_UNMATCH"|"IS_REQUIRED"|"CUSTOM_VALIDATE_FAILED"}[] = [];
    validationSchema.forEach(object => {
        if (objectToValidate[object.param]) {

            //Validar el tipo de dato.
            if ( typeof objectToValidate[object.param] !== object.type ) {
                errors.push({
                    param: object.param, 
                    error: object.error, 
                    errorType: "INCORRECT_TYPE"
                });
            }

            //En caso de que se envíe una expresión regular
            if ( object.regex && !object.regex.test(objectToValidate[object.param]) ) {
                errors.push({
                    param: object.param, 
                    error: object.error, 
                    errorType: "REGEX_UNMATCH"
                });
            }

            if (
                object.customValidate && 
                (typeof object.customValidate === "function" 
                && !object.customValidate(objectToValidate[object.param]))) {
                errors.push({
                    param: object.param, 
                    error: object.error, 
                    errorType: "CUSTOM_VALIDATE_FAILED"
                });
            }

        }else{
            if (object.required) {
                errors.push({
                    param: object.param, 
                    error: object.error,
                    errorType: "IS_REQUIRED"
                });
            }
        }
    });

    return errors;
}

export const commonValidator: {[key:string]: IValidationSchemaItem} = {
    email: {
        param: 'email',
        type:'string',
        error:'Formato de Correo Incorrecto',
        required: false,
        regex: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/  
    },
    password: {
        param: 'password',
        type:'string',
        error:'Password must contain 1 number (0-9), 1 uppercase letter, 1 lowercase letter,  1 non-alpha numeric number, Password Length: 8-16 char.',
        required: false,
        regex: /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/  
    },
    username: {
        param: 'username',
        type:'string',
        error:'Wrong Username format. non-alpha numeric not allowed, Length: 6-12 char. ',
        required: false,
        regex: /^(?=[a-zA-Z0-9._]{6,12}$)(?!.*[_.]{2})[^_.].*[^_.]$/ 
    },

}