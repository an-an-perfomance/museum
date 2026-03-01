import React from "react";
import { Layout, Typography } from "antd";
import { colors } from "../theme/colors";

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

export const Footer: React.FC = () => {
  return (
    <AntFooter
      style={{
        textAlign: "center",
        background: colors.background,
        borderTop: `1px solid ${colors.border}`,
        color: colors.textSecondary,
        padding: "16px 24px",
      }}
    >
      <Text style={{ color: colors.textSecondary, marginRight: 16 }}>
        Музей школы №323 · КОЦ «Оккервиль»
      </Text>
      <a
        href="https://school323.ru/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: colors.primary }}
      >
        Основной сайт
      </a>
    </AntFooter>
  );
};
