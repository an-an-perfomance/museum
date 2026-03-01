import { useEffect } from "react";
import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import { ConfigProvider, Layout } from "antd";
import ruRU from "antd/locale/ru_RU";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { fetchPhotos } from "./store/photosSlice";
import { Landing } from "./components/Landing";
import { Gallery } from "./components/Gallery";
import { AdminPanel } from "./components/AdminPanel";
import { LoginPage } from "./components/LoginPage";
import { Header } from "./components/Header";
import { PhotoDetails } from "./components/PhotoDetails";

const { Content } = Layout;

const PrivateRoute = ({ children, role }: { children: JSX.Element; role?: string }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (role && user?.role !== role) return <Navigate to="/" />;
  return children;
};

export function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(fetchPhotos());
  }, [dispatch]);

  return (
    <ConfigProvider
      locale={ruRU}
      theme={{
        token: {
          colorPrimary: "#1a5fa8",
          colorLink: "#1a5fa8",
          colorLinkHover: "#f5a623",
          borderRadius: 6,
        },
      }}
    >
      <HashRouter>
        <Layout style={{ minHeight: "100vh", background: "#f0f6ff" }}>          <Header />
          <Content>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/photo/:id" element={<PhotoDetails />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/admin"
                element={
                  <PrivateRoute role="ADMIN">
                    <AdminPanel />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Content>
        </Layout>
      </HashRouter>
    </ConfigProvider>
  );
}
