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
    reactionsCount: {
        reaction1: 0,
        reaction2: 0
    };
    comments?: Array<{
        id: number, 
        text:string
    }>;
    tags: Array<{ 
        tagDescription:string
    }>;
    createdAt:Date;
}
