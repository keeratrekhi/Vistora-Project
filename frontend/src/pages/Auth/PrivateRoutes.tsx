import { useSelector } from "react-redux";
import { Outlet,Navigate } from "react-router-dom";

export default function PrivateRoutes(){
    const { currentUser } = useSelector((state : {
        user: {
         currentUser: {
           id:string,
         }
        }
      })=>state.user);

      return currentUser ? <Outlet/> :< Navigate to='/login'/>

}