import React, { ReactElement, useCallback, useMemo, useState } from "react";
import {
  useCancelProject,
  useCreateProject as useCreateProjectQuery,
  useUpdateProject as useUpdateProjectQuery,
} from "react-query";
import { useNavigate } from "react-router-dom";

import { Modal, Result, message } from "antd";
import { RouteUrl, basicDetailsConstants } from "constant";
import { CreateProjectRequest } from "interfaces";
import { StepperFormLayout } from "layout";

import {
  BasicDetails,
  Button,
  ConfirmationModal,
  EmailNotification,
  GrantAccess,
  Integrations,
  Loading,
  Text,
} from "components";

import { CreateProjectProvider, useCreateProject } from "context";

import { Colors } from "themes";

import "./CreateNewProject.styles.scss";

/**
 * CreateNewProjectContent
 *
 * This component renders the content of the CreateNewProject page.
 *
 * It uses the useCreateProject hook to get the project id and the basic
 * details form, and the useCreateProjectQuery and useUpdateProjectQuery
 * hooks to create and update the project.
 *
 * The component also renders the StepperFormLayout component, which
 * renders the stepper items and the current step element.
 *
 * The component handles the change of the current step by calling the
 * changeCurrentStep function, which calls the mutateAsync function of the
 * createProjectQuery or updateProjectQuery hooks, depending on whether the
 * project id is defined or not.
 *
 * The component also handles the validation of the basic details form by
 * calling the validateFields function of the form.
 *
 * The component renders the GrantAccess and EmailNotification components
 * depending on the current step.
 *
 * @returns {ReactElement} The CreateNewProjectContent component.
 */
const CreateNewProjectContent = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [disabledChangeStep, setDisabledChangeStep] = useState<boolean>(false);
  const { projectId, basicDetailsForm, setProjectId } = useCreateProject();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSkipBtn, setShowSkipBtn] = useState<boolean>(true);
  const [confirmCancel, setConfirmCancel] = useState<boolean>(false);
  const [isOpenSuccessModal, setIsOpenSuccessModal] = useState<boolean>(false);

  const navigate = useNavigate();

  const [messageApi, contextHolder] = message.useMessage();

  const error = () => {
    messageApi.open({
      type: "error",
      content: "Error: Something went wrong",
    });
  };

  const createProjectQuery = useCreateProjectQuery();
  const updateProjectQuery = useUpdateProjectQuery();
  const cancelProjectQuery = useCancelProject();

  const {
    PROJECT_NAME,
    PROJECT_DESCRIPTION,
    PRIVACY,
    PRIMARY_TAGS,
    SECONDARY_TAGS,
  } = basicDetailsConstants;

  const stepperItems: Array<string> = [
    "Basic Details",
    "Integrations",
    "Grant Access",
    "Email Notification",
  ];

  /**
   * Handles the cancellation of a project.
   *
   * This function will set `isLoading` to true, call the `mutateAsync` function
   * of the `cancelProjectQuery` hook with the current `projectId`, and then
   * navigate to the dashboard page. If the cancellation fails, it will print
   * the error to the console. Finally, it will set `isLoading` to false.
   */
  const handleCancel = async () => {
    try {
      setIsLoading(true);

      if (projectId) await cancelProjectQuery.mutateAsync(projectId);

      navigate(RouteUrl.HOME.DASHBOARD);
    } catch (err) {
      console.error(err);

      error();
    } finally {
      setIsLoading(false);
    }
  };

  const changeCurrentStep = useCallback(
    async (step: number) => {
      try {
        setIsLoading(true);
        setDisabledChangeStep(false);
        setShowSkipBtn(false);

        if (currentStep === 0 && step === 1) {
          await basicDetailsForm.validateFields();

          const basicDetailsPrimaryTag = basicDetailsForm
            .getFieldValue(PRIMARY_TAGS.NAME)
            .filter((tag) => {
              return Object.keys(tag)?.length > 0;
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
              return Object.keys(tag)?.length > 0;
            })
            .map((tag) => {
              return {
                ...tag,
                tag_type: "Secondary",
              };
            });

          const req: CreateProjectRequest = {
            name: basicDetailsForm.getFieldValue(PROJECT_NAME.NAME),
            description: basicDetailsForm.getFieldValue(
              PROJECT_DESCRIPTION.NAME,
            ),
            visibility: basicDetailsForm.getFieldValue(PRIVACY.NAME),
            tags: [...basicDetailsPrimaryTag, ...basicDetailsSecondaryTag],
          };

          if (projectId) {
            await updateProjectQuery.mutateAsync({
              id: projectId,
              updateProjectProjectRequest: req,
            });
          } else {
            const res = await createProjectQuery.mutateAsync(req);
            setProjectId(res?.project_id.toString());
          }
        }

        if (currentStep === 3 && step === 1) {
          setIsOpenSuccessModal(true);
        }

        setCurrentStep(
          Math.min(Math.max(currentStep + step, 0), stepperItems?.length - 1),
        );
      } catch (err) {
        console.error(err);

        if (err?.response || err?.request) {
          error();
        }
      } finally {
        setIsLoading(false);
        setShowSkipBtn(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      currentStep,
      stepperItems?.length,
      basicDetailsForm,
      createProjectQuery,
      setProjectId,
    ],
  );

  const CurrentStepElement: ReactElement | string = useMemo(() => {
    switch (currentStep) {
      case 0:
        return <BasicDetails setDisabledSave={setDisabledChangeStep} />;
      case 1:
        return (
          <Integrations
            project_id={parseInt(projectId)}
            setShowSkipBtn={setShowSkipBtn}
            setDisabledNext={setDisabledChangeStep}
          />
        );
      case 2:
        return (
          <GrantAccess
            project_id={parseInt(projectId)}
            setShowSkipBtn={setShowSkipBtn}
            setDisabledNext={setDisabledChangeStep}
          />
        );
      case 3:
        return <EmailNotification />;
      default:
        return;
    }
  }, [projectId, currentStep]);

  return (
    <StepperFormLayout
      title="Create Portfolio"
      description="Description if any."
      currentStep={currentStep}
      steps={stepperItems}
      stepAction={changeCurrentStep}
      disabledChangeStep={disabledChangeStep || isLoading}
      showSkipButton={
        currentStep !== 0 &&
        currentStep !== stepperItems?.length - 1 &&
        showSkipBtn
      }
      onCancel={() => {
        setConfirmCancel(true);
      }}
    >
      {CurrentStepElement}
      {(createProjectQuery.isLoading || updateProjectQuery.isLoading) && (
        <Loading />
      )}
      <ConfirmationModal
        title={
          <Text
            type="cardtitle"
            weight="semibold"
            text="Are you sure to cancel creating Portfolio."
          />
        }
        open={confirmCancel}
        message={
          <Text
            type="bodycopy"
            color={Colors.COOL_GRAY_12}
            text="Are you sure to cancel creating Portfolio? You will loose the details that you filled."
          />
        }
        onCancel={() => setConfirmCancel(false)}
        okText="Yes, I am sure"
        onConfirm={handleCancel}
        width={350}
        loading={isLoading}
        centered
      />
      {contextHolder}
      <Modal
        open={isOpenSuccessModal}
        closable={false}
        footer={null}
        centered
        title={null}
      >
        <Result
          style={{ padding: 20 }}
          title="Portfolio Created Successfully"
          status="success"
          extra={[
            <Button
              title="Go to Portfolios"
              type="link"
              style={{ fontSize: 17, fontWeight: 600 }}
              onClick={() => navigate(RouteUrl.HOME.DASHBOARD)}
            />,
          ]}
        />
      </Modal>
    </StepperFormLayout>
  );
};

/**
 * CreateNewProject
 *
 * This component renders the CreateNewProject page.
 *
 * It wraps the CreateNewProjectContent component with the CreateProjectProvider.
 */
const CreateNewProject: React.FC = () => {
  return (
    <CreateProjectProvider>
      <CreateNewProjectContent />
    </CreateProjectProvider>
  );
};

export default CreateNewProject;
