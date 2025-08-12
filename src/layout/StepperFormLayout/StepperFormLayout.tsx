import React, { ReactElement, useCallback, useMemo } from "react";

import {
  CheckCircleFilled,
  CheckCircleOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import { Flex, Layout, Steps } from "antd";
import Sider from "antd/es/layout/Sider";
import { Content } from "antd/es/layout/layout";
import { GenericIconType } from "interfaces";

import { Progress } from "assets";

import { Button, IconViewer, Text } from "components";

import { Colors, Metrics } from "themes";

import "./stepperFormLayout.styles.scss";

interface StepperItem {
  title: string;
  description: string;
  icon: ReactElement;
}
interface StepperIconMapper {
  [key: number]: {
    icon: GenericIconType;
    color: string;
  };
}
interface LayoutProps {
  title: string;
  description: string;
  steps: Array<string>;
  currentStep: number;
  stepAction: (step: number, skip?: boolean) => void;
  disabledChangeStep: boolean;
  showSkipButton?: boolean;
  children: React.ReactNode;
  onCancel: () => void
}
const StepperIconMap: StepperIconMapper = {
  0: { icon: Progress, color: Colors.PRIMARY_BLUE },
  1: { icon: CheckCircleFilled, color: Colors.PRIMARY_GREEN_600 },
  2: { icon: CheckCircleOutlined, color: Colors.COOL_GRAY_6 },
};
/**
 * StepperFormLayout
 *
 * This component renders a StepperFormLayout that provides a step-by-step
 * wizard form layout. The component uses the Ant Design Steps component to
 * render the steps of the wizard, and the Ant Design Flex component to render
 * the content of each step. The component also renders a button to navigate
 * to the previous step, a button to navigate to the next step, and a button
 * to submit the form. The component also renders a button to cancel the
 * form. The component also renders a button to skip the current step.
 *
 * The component accepts the following props:
 *
 * - `title`: The title of the stepper.
 * - `description`: The description of the stepper.
 * - `steps`: An array of strings that represent the steps of the stepper.
 * - `currentStep`: The current step of the stepper.
 * - `stepAction`: A function that is called when the user navigates to the
 *   previous or next step.
 * - `disabledChangeStep`: A boolean that indicates whether the user is
 *   allowed to navigate to the previous or next step.
 * - `showSkipButton`: A boolean that indicates whether to show the skip
 *   button. Defaults to true.
 * - `children`: The content of the current step.
 *
 * @param {LayoutProps} props - The props for the StepperFormLayout component.
 *
 * @returns {ReactElement} The StepperFormLayout component.
 */

const StepperFormLayout: React.FC<LayoutProps> = ({
  title,
  description,
  steps,
  currentStep,
  stepAction,
  children,
  disabledChangeStep,
  showSkipButton = true,
  onCancel = () => {}
}: LayoutProps) => {
  const icon = useCallback(
    (index: number): ReactElement => {
      const step: number =
        index === currentStep ? 0 : index < currentStep ? 1 : 2;
      return (
        <IconViewer
          Icon={StepperIconMap[step].icon}
          color={StepperIconMap[step].color}
          size={24}
          width={24}
          height={24}
        />
      );
    },
    [currentStep],
  );
  const stepperItems: Array<StepperItem> = useMemo(() => {
    return steps?.map((step, index) => {
      return {
        title: `Step 0${index + 1}`,
        description: step,
        icon: icon(index),
      };
    });
  }, [steps, icon]);
  return (
    <Layout className="create-stepper-form-container">
      <Sider className="stepper-container" width={300}>
        <Flex vertical gap={Metrics.SPACE_LG}>
          <Flex vertical gap={Metrics.SPACE_XS}>
            <Text text={title} type="subtitle" weight="semibold" />
            <Text
              text={description}
              type="footnote"
              weight="semibold"
              customClass="description-title"
            />
          </Flex>
          <Steps
            current={currentStep}
            direction="vertical"
            items={stepperItems}
            className="stepper"
          />
        </Flex>
      </Sider>

      <Content className="stepper-content-container">
        <Flex
          gap={Metrics.SPACE_MD}
          vertical
          justify="space-between"
          align="center"
          style={{ height: "100%" }}
        >
          <Flex
            gap={Metrics.SPACE_XL}
            className="stepper-content-innerContainer"
            vertical
          >
            <Flex gap={Metrics.SPACE_XXS} vertical>
              <Text
                text={`Step 0${currentStep + 1}`}
                type="footnote"
                weight="regular"
              />
              <Text
                text={stepperItems[currentStep]?.description}
                type="title"
                weight="semibold"
              />
            </Flex>
            {children}
          </Flex>
          <Flex
            align="center"
            justify="space-between"
            className="stepper-action-container"
          >
            {currentStep > 0 && (
              <Button
                type="text"
                title="Prev"
                icon={
                  <IconViewer
                    Icon={LeftOutlined}
                    color={Colors.COOL_GRAY_11}
                    size={12}
                  />
                }
                onClick={() => stepAction(-1)}
              />
            )}
            <Flex
              align="center"
              gap={Metrics.SPACE_XS}
              className="action-buttons-right"
            >
              {showSkipButton && (
                <Button
                  type="text"
                  title="Skip"
                  onClick={() => stepAction(1, true)}
                  size="middle"
                />
              )}
              <Button type="default" title="Cancel" size="middle" onClick={onCancel} />
              <Button
                type="primary"
                title={currentStep === steps?.length - 1 ? "Submit" : "Next"}
                size="middle"
                onClick={() => stepAction(1)}
                disabled={disabledChangeStep}
              />
            </Flex>
          </Flex>
        </Flex>
      </Content>
    </Layout>
  );
};
export default StepperFormLayout;
