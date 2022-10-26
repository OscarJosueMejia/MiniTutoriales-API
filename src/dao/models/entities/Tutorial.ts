export interface ITutorial {
    _id?: unknown; 
    authorId: unknown;
    title: string;
    description: string;
    requirements: string;
    steps: Array<{
        stepNumber:number,
        description: string,
        imgURL:string
    }>;
    reactionsCount?: {
        reaction_IsUtil: Array<string>, 
        reaction_Dislike: Array<string>
    };
    comments?: Array<ITutorialComment>;
    tags: Array<{ 
        tagDescription:string
    }>;
    createdAt:Date;
}

export interface ITutorialComment{
    _id?: unknown,
    userId: unknown, 
    text: string
}
