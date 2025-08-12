import { createContext, useContext, useState } from "react";

import { Form, FormInstance } from "antd";
import { BasicDetailsFormField, SLOAndErrorBudgetFormField } from "interfaces";

interface ContextState {
  children: React.ReactNode;
}

interface ICreateProjectContext {
  projectId: string | null;
  basicDetailsForm?: FormInstance<BasicDetailsFormField>;
  sloAndErrorBudgetForm?: FormInstance<SLOAndErrorBudgetFormField>;
  setProjectId: (id: string) => void;
}

const initialValue = {
  users: [],
  projectId: null,
  setProjectId: () => {},
};

const CreateProjectContext = createContext<ICreateProjectContext>(initialValue);

/**
 * Provider for the CreateProjectContext, which stores the project ID and a form for the basic details of a project.
 * The context is used by the CreateNewProject component and the BasicDetails component.
 *
 * @prop {React.ReactChild} children - The components to be rendered with the context.
 *
 * @returns {JSX.Element} The context provider component.
 */
const CreateProjectProvider = ({ children }: ContextState) => {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [basicDetailsForm] = Form.useForm<BasicDetailsFormField>();
  const [sloAndErrorBudgetForm] = Form.useForm<SLOAndErrorBudgetFormField>();

  return (
    <CreateProjectContext.Provider
      value={{
        basicDetailsForm,
        sloAndErrorBudgetForm,
        projectId,
        setProjectId,
      }}
    >
      {children}
    </CreateProjectContext.Provider>
  );
};

export default CreateProjectProvider;

// eslint-disable-next-line react-refresh/only-export-components
export const useCreateProject = () => {
  return useContext(CreateProjectContext);
};
