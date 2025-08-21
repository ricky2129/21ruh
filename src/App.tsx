import React from "react";
import { Outlet } from "react-router-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";

import { AppNavigationProvider } from "context";
import AuthProvider from "context/AuthProvider";
import DriftAssistProvider from "context/DriftAssistProvider";

import antdTheme from "themes/antdTheme";

const App: React.FC = () => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={antdTheme}>
        <AuthProvider>
          <DriftAssistProvider>
            <AppNavigationProvider>
              <Outlet />
            </AppNavigationProvider>
          </DriftAssistProvider>
        </AuthProvider>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default App;
