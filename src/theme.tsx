import ConfigProvider from "antd/es/config-provider"
import type { ReactNode } from "react"

export const ThemeProvider = ({ children = null as ReactNode }) => (
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: "#1f1f1f"
      }
    }}>
    {children}
  </ConfigProvider>
)
