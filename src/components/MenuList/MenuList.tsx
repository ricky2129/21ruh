import { useState } from "react";

import { DeleteOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import { Flex, Form, FormInstance, Input } from "antd";

import { Button, IconViewer, Text } from "components";

import { Colors, Metrics } from "themes";

import "./MenuList.styles.scss";

interface MenuListProps {
  title: string;
  label?: string;
  fixedLength?: boolean;
  showHideArrow?: boolean;
  form?: FormInstance<any>;
}

const MenuList: React.FC<MenuListProps> = ({
  form,
  title,
  label,
  fixedLength = false,
  showHideArrow = true,
}) => {
  const list = Form.useWatch(title, {
    form,
    preserve: true,
  });

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(!showHideArrow);

  /**
   * Handles the menu toggling
   *
   * - toggles `isMenuOpen` state
   * - resets the form fields of the list
   */
  const handleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    form.resetFields([title]);
  };

  return (
    <Flex vertical gap={Metrics.SPACE_XS}>
      <Flex gap={Metrics.SPACE_XXS} align="center">
        {showHideArrow && (
          <IconViewer
            Icon={isMenuOpen ? UpOutlined : DownOutlined}
            size={11}
            customClass="cursor-pointer"
            onClick={handleMenu}
          />
        )}
        <Text
          text={label}
          type="footnote"
          weight="semibold"
          customClass="menu-list-title"
        />
      </Flex>
      {isMenuOpen && (
        <Flex className="menu-list-container" vertical>
          <Flex align="center" className="tags-container" justify="start">
            <Text
              text="Key"
              weight="semibold"
              type="footnote"
              customClass="tags-header-text"
            />
            <Text text="Value" weight="semibold" type="footnote" />
          </Flex>
          <Form.List name={title}>
            {(fields, { add, remove }) => (
              <Flex
                vertical
                gap={Metrics.SPACE_MD}
                className="form-list-container"
              >
                {fields.map(({ key, name, ...restField }, index) => (
                  <Flex
                    gap={Metrics.SPACE_MD}
                    key={key}
                    className="menu-list-item"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "key"]}
                      className="formlist-input-container"
                      rules={[
                        () => ({
                          validator: () => {
                            for (let i = 0; i < list.length; i++) {
                              if (
                                i !== index &&
                                list[i]?.key === list[index]?.key &&
                                list[i]?.key?.trim()?.length > 0
                              ) {
                                return Promise.reject("key must be unique");
                              }

                              if (
                                list[index]?.value?.trim().length > 0 &&
                                !list[index]?.key
                              ) {
                                return Promise.reject(
                                  "key is required when value is filled",
                                );
                              }
                            }

                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <Input placeholder="Type here" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "value"]}
                      className="formlist-input-container"
                    >
                      <Input
                        placeholder="Type here"
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            !fixedLength &&
                            index === fields.length - 1
                          ) {
                            add();
                          }
                        }}
                      />
                    </Form.Item>
                    {index !== fields.length - 1 && !fixedLength && (
                      <Button
                        type="icon"
                        icon={
                          <IconViewer
                            Icon={DeleteOutlined}
                            color={Colors.BRIGHT_RED}
                            size={25}
                          />
                        }
                        onClick={() => remove(index)}
                      />
                    )}
                  </Flex>
                ))}
              </Flex>
            )}
          </Form.List>
        </Flex>
      )}
    </Flex>
  );
};

export default MenuList;
