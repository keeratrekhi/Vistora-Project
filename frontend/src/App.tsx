import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthenticateRoutes, NonAuthenticateRoutes } from "./AppRoutes";
import Layout from "./components/layout/Layout";
import NotFound from "./pages/NotFound";
import PrivateRoutes from "./pages/Auth/PrivateRoutes";
import { Toaster } from "react-hot-toast";

const App = () => (
  <BrowserRouter>
    <Toaster 
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        className: "bg-gray-800 text-white",
        style: {
          fontSize: "16px",
          padding: "10px 20px",
        },
      }}
    />
    <Routes>
      {NonAuthenticateRoutes.map((route, index) => {
        const { element, ...rest }: any = route;
        return <Route key={index} {...rest} element={element} />;
      })}
      <Route element={<PrivateRoutes />}>
        {AuthenticateRoutes.map((route, index) => {
          const { element, withLayout, ...rest }: any = route;
          if (!withLayout)
            return <Route key={index} {...rest} element={element} />;

          return (
            <Route key={index} element={<Layout />}>
              <Route {...rest} element={element} />
            </Route>
          );
        })}
      </Route>
      {<Route path="*" element={<NotFound />} />}
    </Routes>
  </BrowserRouter>
);

export default App;
