import { Colors, Metrics } from "themes";

export const sidenavTheme = {
  components: {
    Menu: {
      itemColor: Colors.COOL_GRAY_11,
      itemBg: Colors.SIDENAV_GRAY,
      subMenuItemBg: Colors.SIDENAV_GRAY,
      itemSelectedColor: Colors.PRIMARY_BLUE,
      itemSelectedBg: Colors.SECONDARY_BLUE_1_60,
      colorSplit: Colors.SIDENAV_GRAY,

      iconSize: Metrics.SIDEBAR_ICON_SIZE,
      collapsedIconSize: Metrics.SIDEBAR_ICON_SIZE,
      itemHeight: Metrics.SPACE_XXL,
      itemPaddingInline: Metrics.SPACE_XS,
      iconMarginInlineEnd: Metrics.SPACE_XS,
      itemBorderRadius: Metrics.SPACE_XXS,
      itemMarginInline: Metrics.SPACE_XXS,
      itemMarginBlock: Metrics.SPACE_XXS,
    },
  },
};
