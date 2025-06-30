import { Navigate } from "react-router-dom";
import {
  ADMIN_EVENT_PAGE_ROUTE,
  CHUNK_UPLOAD_ROUTE,
 // CREATE_EVENT_ROUTE,
  DASHBOARD_ROUTE,
  EVENT_SHARE_ROUTE,
  ADMIN_EVENTS_ROUTE,
  HOME_ROUTE,
  LOGIN_ROUTE,
  NOT_FOUND_ROUTE,
  PORTFOLIO_INFO_ROUTE,
  PORTFOLIO_ROUTE,
  SIGNUP_ROUTE,
  PROFILE_ROUTE,
  PLANS_ROUTE,
  CREATE_EVENT_ROUTE,
  PUBLISHED_ROUTE,
} from "./constants/RouteContant";
import Login from "./pages/Auth/Login";
// import Signup from "./pages/Auth/Signup";
import Dashboard from "./pages/Admin/Dashboard";
import AdminEventsPage from "./pages/Admin/AdminEventsPage";
// import EventForm from "./components/EventForm";
import PortfolioInfo from "./pages/Admin/PortfolioInfo";
import Portfolio from "./pages/Portfolio";
import EventShare from "./pages/EventShare";
import NotFound from "./pages/NotFound";
import AdminEventPage from "./pages/Admin/AdminEventPage";
import Profile from "./pages/Profile";
import Plans from "./pages/Plans";
import { CreateEvent } from "./pages/Admin/CreateEvent";
import EventGalleryPage from "./pages/EventGalleryPage";
// import LandingPage from "./pages/LandingPage";


interface RouteObject {
  path: string,
  element: any,
  withLayout: boolean
}

export const NonAuthenticateRoutes: RouteObject[] = [
  // {
  //   path:HOME_ROUTE,
  //   element:<LandingPage/>,
  //   withLayout:false,
  // },
  {
    path: LOGIN_ROUTE,
    element: <Login />,
    withLayout: false
  },
  // {
  //   path: SIGNUP_ROUTE,
  //   element: <Signup />,
  //   withLayout: false
  // },
  {
    path : NOT_FOUND_ROUTE,
    element : <NotFound />,
    withLayout : false
  },

  {
  path: PUBLISHED_ROUTE,
  element: <EventGalleryPage />,
  withLayout: false
},
{
    path: PORTFOLIO_ROUTE,
    element: <Portfolio />,
    withLayout: false,
  },

];



export const AuthenticateRoutes: RouteObject[] = [
  {
    path: HOME_ROUTE,
    element: <Navigate to={DASHBOARD_ROUTE} />,
    withLayout: true,
  },
  {
    path: DASHBOARD_ROUTE,
    element: <Dashboard />,
    withLayout: true,
  },
  {
    path: ADMIN_EVENTS_ROUTE,
    element: <AdminEventsPage />,
    withLayout: true,
  },
  {
    path: CREATE_EVENT_ROUTE,
    element: <CreateEvent />,
    withLayout: true,
  },
  {
    path: PORTFOLIO_INFO_ROUTE,
    element: <PortfolioInfo />,
    withLayout: true,
  },
  
  {
    path : EVENT_SHARE_ROUTE,
    element : <EventShare />,
    withLayout : false
  },
  {
    path : ADMIN_EVENT_PAGE_ROUTE,
    element : <AdminEventPage />,
    withLayout : false
  },
  
  {
    path: PROFILE_ROUTE,
    element: <Profile/>,
    withLayout: true,
  },
  
  {
    path: PLANS_ROUTE,
    element: <Plans/>,
    withLayout: true,
  },
];
