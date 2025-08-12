import React, { ReactElement, useCallback, useMemo, useState } from "react";
import {
  useCancelApplication,
  useCreateApplication as useCreateApplicationQuery,
} from "react-query";
import { useNavigate, useParams } from "react-router-dom";

import { Modal, Result, message } from "antd";
import { RouteUrl, basicDetailsApplicationConstants } from "constant";
import { resolveUrlParams } from "helpers";
import { CreateApplicationRequest } from "interfaces";
import { StepperFormLayout } from "layout";

import {
  ApplicationBasicDetails,
  Button,
  ConfirmationModal,
  Text,
  WorkFlowConfiguration,
} from "components";

import { CreateApplicationProvider, useCreateApplication } from "context";

import { Colors } from "themes";

import "./createNewApplication.styles.scss";

interface stepperItem {
  key: "basic_details" | "workflow_configuration";
  label: string;
  component: ReactElement;
}

/**
 * CreateNewApplicationContent
 *
 * This component renders the content for creating a new application. It
 * utilizes a stepper form layout to guide users through the application
 * creation process, including entering basic details and configuring workflows.
 *
 * It manages the state for the current step, loading status, and confirmation
 * modals. It handles the creation and cancellation of the application using
 * relevant hooks and APIs.
 *
 * @returns {ReactElement} The rendered component for creating new applications.
 */
const CreateNewApplicationContent = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [disabledChangeStep, setDisabledChangeStep] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [confirmCancel, setConfirmCancel] = useState<boolean>(false);
  const [isOpenSuccessModal, setIsOpenSuccessModal] = useState<boolean>(false);

  const navigate = useNavigate();
  const { basicDetailsForm, setApplicationId, applicationId } =
    useCreateApplication();

  const { project } = useParams();
  const {
    PRIMARY_TAGS,
    SECONDARY_TAGS,
    APPLICATION_NAME,
    APPLICATION_DESCRIPTION,
    PRIVACY,
  } = basicDetailsApplicationConstants;

  const createApplicationQuery = useCreateApplicationQuery();
  const canelApplicationQuery = useCancelApplication();

  const [messageApi, contextHolder] = message.useMessage();

  /**
   * Opens an error message with the content "Error: Something went wrong".
   * This function is used to report errors that occur during the application
   * creation process.
   */
  const error = () => {
    messageApi.open({
      type: "error",
      content: "Error: Something went wrong",
    });
  };

  const stepperItems: stepperItem[] = useMemo(() => {
    const items: stepperItem[] = [
      {
        key: "basic_details",
        label: "Basic Details",
        component: (
          <ApplicationBasicDetails
            setDisabledSave={setDisabledChangeStep}
            error={createApplicationQuery?.error?.message}
            isError={createApplicationQuery.isError}
          />
        ),
      },
      {
        key: "workflow_configuration",
        label: "Workflow Configuration",
        component: <WorkFlowConfiguration />,
      },
    ];

    return items;
  }, [createApplicationQuery]);

  const CurrentStepElement: ReactElement | string = useMemo(() => {
    return stepperItems[currentStep].component;
  }, [currentStep, stepperItems]);

  const changeCurrentStep = useCallback(
    async (step: number) => {
      try {
        setIsLoading(true);

        if (step === 1 && stepperItems[currentStep].key === "basic_details") {
          await basicDetailsForm.validateFields();

          const basicDetailsPrimaryTag = basicDetailsForm
            .getFieldValue(PRIMARY_TAGS.NAME)
            .filter((tag) => {
              return tag?.key?.trim()?.length > 0;
            })
            .map((tag) => {
              return {
                ...tag,
                tag_type: "Primary",
              };
            });

          const basicDetailsSecondaryTag = basicDetailsForm
            ?.getFieldValue(SECONDARY_TAGS.NAME)
            .filter((tag) => {
              return tag?.key?.trim()?.length > 0;
            })
            .map((tag) => {
              return {
                ...tag,
                tag_type: "Secondary",
              };
            });
          const req: CreateApplicationRequest = {
            name: basicDetailsForm.getFieldValue(APPLICATION_NAME.NAME),
            description: basicDetailsForm.getFieldValue(
              APPLICATION_DESCRIPTION.NAME,
            ),
            tags: [...basicDetailsPrimaryTag, ...basicDetailsSecondaryTag],
            project_id: Number(project),
            privacy: basicDetailsForm.getFieldValue(PRIVACY.NAME),
          };

          const res = await createApplicationQuery.mutateAsync(req);
          setApplicationId(res.application_id);

          setCurrentStep(step);
        } else if (currentStep === 1 && step === 1) {
          setIsOpenSuccessModal(true);
        }
      } catch (err) {
        console.error(err);
        error();
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      stepperItems.length,
      basicDetailsForm,
      createApplicationQuery,
      project,
      setApplicationId,
    ],
  );

  /**
   * Cancels the creation of an application.
   *
   * @remarks
   * This function will set `isLoading` to true, call the `mutateAsync` function
   * of the `canelApplicationQuery` hook with the current `applicationId`, and
   * then navigate to the application list page. If the cancellation fails, it
   * will print the error to the console. Finally, it will set `isLoading` to
   * false.
   */
  const handleCancel = async () => {
    try {
      setIsLoading(true);

      if (applicationId)
        await canelApplicationQuery.mutateAsync(applicationId?.toString());

      navigate(resolveUrlParams(RouteUrl.PROJECTS.APPLICATIONS, { project }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <StepperFormLayout
        title="Create Application"
        description="Description if any."
        currentStep={currentStep}
        steps={stepperItems.map((item) => item.label)}
        stepAction={changeCurrentStep}
        disabledChangeStep={disabledChangeStep || isLoading}
        showSkipButton={false}
        onCancel={() => setConfirmCancel(true)}
      >
        {CurrentStepElement}
      </StepperFormLayout>
      <ConfirmationModal
        title={
          <Text
            type="cardtitle"
            weight="semibold"
            text="Are you sure to cancel creating Application."
          />
        }
        open={confirmCancel}
        message={
          <Text
            type="bodycopy"
            color={Colors.COOL_GRAY_12}
            text="Are you sure to cancel creating Application? You will loose the details that you filled."
          />
        }
        onCancel={() => setConfirmCancel(false)}
        okText="Yes, I am sure"
        onConfirm={handleCancel}
        width={350}
        loading={isLoading}
        centered
      />
      <Modal
        open={isOpenSuccessModal}
        closable={false}
        footer={null}
        centered
        title={null}
      >
        <Result
          style={{ padding: 20 }}
          title="Application Created Successfully"
          status="success"
          extra={[
            <Button
              title="Go to Application"
              type="link"
              style={{ fontSize: 17, fontWeight: 600 }}
              onClick={() =>
                navigate(
                  resolveUrlParams(RouteUrl.PROJECTS.APPLICATIONS, {
                    project,
                  }),
                )
              }
            />,
          ]}
        />
      </Modal>
    </>
  );
};

const CreateNewApplication: React.FC = () => {
  return (
    <CreateApplicationProvider>
      <CreateNewApplicationContent />
    </CreateApplicationProvider>
  );
};

export default CreateNewApplication;
