export const errorhandler=(statusCode:number,message:string)=>{
    const error=new Error();
    (error as any).status=statusCode;
    error.message=message;
    return error;
}