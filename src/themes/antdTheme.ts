import { Colors, Metrics } from "./theme";

const antdTheme = {
  token: {
    colorPrimary: "#1B849B",
    fontFamily: "Open Sans",
    colorBorder: Colors.COOL_GRAY_4,
  },
  components: {
    Button: {
      borderRadius: Metrics.BORDER_RADIUS_MD,
      colorPrimary: Colors.PRIMARY_BLUE,
      controlHeight: 32,
      paddingInline: 16,
      boxShadow: "0px 2px 0px 0px rgba(0, 0, 0, 0.04)",
      fontSize: 14,
    },
    Input: {
      borderRadius: Metrics.BORDER_RADIUS_MD,
      borderRadiusLG: Metrics.BORDER_RADIUS_MD,
    },
    Card: {
      paddingLG: 0,
      colorBorderSecondary: Colors.COOL_GRAY_2,
      borderRadiusLG: Metrics.BORDER_RADIUS_MD,
    },
    Typography: {
      fontFamilyCode: "Open Sans",
      titleMarginBottom: 0,
      colorText: Colors.BLACK,
      colorTextHeading: Colors.BLACK,
      titleMarginTop: 0,
      fontSizeHeading5: 18,
    },
    Alert: {
      borderRadiusLG: Metrics.BORDER_RADIUS_SM,
    },
    Table: {
      borderColor: Colors.SECONDARY_BLUE_0,
      headerBg: Colors.TABLE_HEADER_BG,
      headerColor: Colors.COOL_GRAY_9,
      headerSplitColor: Colors.SECONDARY_BLUE_0,
      colorText: Colors.COOL_GRAY_11_DARK,
      borderRadius: 0,
      headerBorderRadius: 0,
      cellFontSize: 12,
      cellPaddingBlock: 12,
      cellPaddingInline: 12,
    },
    Tabs: {
      cardGutter: 4,
      colorBorderSecondary: Colors.COOL_GRAY_2,
      itemColor: Colors.COOL_GRAY_12,
      itemSelectedColor: Colors.PRIMARY_BLUE,
      cardBg: Colors.COOL_GRAY_1,
    },
  },
};

export default antdTheme;
