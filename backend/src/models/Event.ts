export interface CreateEventModel{
    title : string,
    description : string,
    eventDate : {
        date : string
    },
    location : string,
    coverImage : string,
    isPublished : Boolean,
    publishedUrl:string,
    accessType : string
}