import { useEffect, useReducer, useRef, useState } from "react";

import { CloseCircleFilled } from "@ant-design/icons";
import { Dropdown, Flex, Input, InputRef, MenuProps, Tag } from "antd";
import { MenuInfo } from "rc-menu/lib/interface";

import { FilterIcon } from "assets";

import { IconViewer, Text } from "components";

import { Colors, Metrics } from "themes";

import "./filter.styles.scss";

type MenuType = MenuProps["items"];

export const FilterOperators = {
  OR: "$OR",
  NOT: "$NOT",
};

export type FilterType = {
  property: string;
  value?: string[];
};

type FilterProps = {
  filterParams: FilterType[];
};

type MenuStateType = {
  menuItems: MenuType;
  isMenuOpen: boolean;
  operatorMenu: string[];
  isOperatorMenuOpen: boolean;
  propertyMenu: string[];
  isPropertyMenuOpen: boolean;
  valueMenu: string[];
  isValueMenuOpen: boolean;
};

const Filter: React.FC<FilterProps> = ({ filterParams }) => {
  const [menu, updateMenu] = useReducer<
    React.Reducer<MenuStateType, Partial<MenuStateType>>
  >(
    (prev, next) => {
      const newMenu = { ...prev, ...next };
      newMenu.menuItems = [];

      if (newMenu.isOperatorMenuOpen) {
        newMenu.menuItems.push({
          key: "operator",
          label: "Operators",
          type: "group",
          children: newMenu.operatorMenu.map((operator) => ({
            key: operator,
            label: operator.substring(1),
          })),
        });
      }

      if (newMenu.isPropertyMenuOpen) {
        newMenu.menuItems.push({
          key: "property",
          label: "Properties",
          type: "group",
          children: newMenu.propertyMenu.map((property) => ({
            key: property,
            label: property,
          })),
        });
      }

      if (newMenu.isValueMenuOpen) {
        newMenu.menuItems.push({
          key: "value",
          label: "Values",
          type: "group",
          children: newMenu.valueMenu.map((keyword) => ({
            key: keyword,
            label: keyword,
          })),
        });
      }
      return newMenu;
    },
    {
      menuItems: [] as MenuType,
      isMenuOpen: false,
      operatorMenu: [FilterOperators.OR],
      isOperatorMenuOpen: false,
      propertyMenu: filterParams.map((params) => params.property),
      isPropertyMenuOpen: true,
      valueMenu: [] as string[],
      isValueMenuOpen: false,
    },
  );
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isDropdownFocused, setIsDropdownFocused] = useState(false);
  const [filters, setFilters] = useState<{ key: string; value: string }[]>([]);
  const [currentProperty, setCurrentProperty] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    updateMenu({ isMenuOpen: isInputFocused || isDropdownFocused });
  }, [isInputFocused, isDropdownFocused]);

  const handleMenuClick = (e: MenuInfo) => {
    if (menu.isPropertyMenuOpen) {
      if (Object.values(FilterOperators).includes(e.key)) {
        updateMenu({
          isOperatorMenuOpen: false,
          isValueMenuOpen: false,
        });
        setFilters([...filters, { key: "$operator", value: e.key }]);
      } else {
        setCurrentProperty(e.key);
        setInputValue(e.key + ": ");
        updateMenu({
          isPropertyMenuOpen: false,
          isValueMenuOpen: true,
          isOperatorMenuOpen: false,
          valueMenu: filterParams.find((params) => params.property === e.key)
            .value,
        });
      }
    } else if (menu.isValueMenuOpen) {
      setFilters([...filters, { key: currentProperty, value: e.key }]);
      setCurrentProperty("");
      setInputValue("");
      updateMenu({
        isValueMenuOpen: false,
        isOperatorMenuOpen: true,
        isPropertyMenuOpen: true,
      });
    }
    inputRef.current!.focus({ cursor: "start", preventScroll: true });
  };

  return (
    <Flex flex={1} className="filter-component">
      <Dropdown
        menu={{
          items: menu.menuItems,
          selectable: false,
          onClick: handleMenuClick,
          onFocus: () => setIsDropdownFocused(true),
          onBlur: () => setIsDropdownFocused(false),
        }}
        open={menu.isMenuOpen}
        overlayStyle={{ minWidth: "none" }}
      >
        {/* TODO: need to fix tags. Cannot be inside prefix as */}
        {/* the tags grows the prefix covers the input completely */}
        {/* and cannot see the input cursor */}
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          prefix={
            <Flex gap={Metrics.SPACE_MD}>
              <Flex gap={10} align="center">
                <IconViewer
                  Icon={FilterIcon}
                  size={Metrics.SPACE_MD}
                  color={Colors.COOL_GRAY_12}
                />
                <Text
                  text="Filter"
                  weight="semibold"
                  color={Colors.COOL_GRAY_12}
                />
              </Flex>
              {filters.length > 0 && (
                <Flex gap={Metrics.SPACE_XXS} className="filter-tags">
                  {filters.map((filter) => (
                    <Tag
                      bordered={false}
                      color={Colors.PRIMARY_BLUE}
                      closeIcon={
                        <IconViewer
                          Icon={CloseCircleFilled}
                          color={Colors.WHITE}
                          size={Metrics.SPACE_SM}
                        />
                      }
                    >
                      <Text
                        key={filter.key}
                        text={`${filter.key}: ${filter.value}`}
                        type="footnote"
                        weight="semibold"
                        color={Colors.WHITE}
                      />
                    </Tag>
                  ))}
                </Flex>
              )}
            </Flex>
          }
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
        />
      </Dropdown>
    </Flex>
  );
};

export default Filter;
