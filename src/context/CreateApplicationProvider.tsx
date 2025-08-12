import { createContext, useContext, useState } from "react";

import { Form, FormInstance } from "antd";
import {
  BasicDetailsApplicationFormField,
  GrantAccessUserFormField,
  SLOType,
} from "interfaces";

interface ContextState {
  children: React.ReactNode;
}

interface ICreateApplicationContext {
  basicDetailsForm?: FormInstance<BasicDetailsApplicationFormField>;
  users: GrantAccessUserFormField[];
  sloTableData: SLOType[];
  applicationId: number;
  setApplicationId: (id: number) => void;
  addSloTableData: (data: SLOType) => void;
  editSloTableData: (id: string, data: SLOType) => void;
  addUser: (user: GrantAccessUserFormField) => void;
  deleteSloTableData: (key: string) => void;
  editUser: (index: number, user: GrantAccessUserFormField) => void;
  deleteUser: (index: number) => void;
}

const initialValue = {
  users: [],
  applicationId: null,
  sloTableData: [],
  setApplicationId: () => {},
  addUser: () => {},
  editUser: () => {},
  deleteUser: () => {},
  addSloTableData: () => {},
  editSloTableData: () => {},
  deleteSloTableData: () => {},
};

const CreateApplicationContext =
  createContext<ICreateApplicationContext>(initialValue);

const CreateApplicationProvider = ({ children }: ContextState) => {
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [sloTableData, setSloTableData] = useState<SLOType[]>([]);
  const [basicDetailsForm] = Form.useForm<BasicDetailsApplicationFormField>();

  const [users, setUsers] = useState<GrantAccessUserFormField[]>([]);

  const addUser = (user: GrantAccessUserFormField) => {
    setUsers((prevUsers) => [...prevUsers, user]);
  };

  const editUser = (id: number, details: GrantAccessUserFormField) => {
    setUsers((prevUsers) =>
      prevUsers.map((prevUser) => {
        if (prevUser.id === id) {
          return {
            ...prevUser,
            ...details,
          };
        }

        return prevUser;
      }),
    );
  };

  const deleteUser = (id: number) => {
    setUsers((prevUsers) =>
      prevUsers.filter((prevUser) => {
        return prevUser.id !== id;
      }),
    );
  };

  const addSloTableData = (data: SLOType) => {
    setSloTableData((prevData) => [...prevData, data]);
  };

  const editSloTableData = (id: string, data: SLOType) => {
    setSloTableData((prevData) =>
      prevData.map((prevData) => {
        if (prevData.key === id) {
          return {
            ...prevData,
            ...data,
          };
        }

        return prevData;
      }),
    );
  };

  const deleteSloTableData = (key: string) => {
    setSloTableData((prevData) =>
      prevData.filter((prevData) => {
        return prevData.key !== key;
      }),
    );
  };

  return (
    <CreateApplicationContext.Provider
      value={{
        applicationId,
        basicDetailsForm,
        users,
        sloTableData,
        setApplicationId,
        addSloTableData,
        deleteSloTableData,
        editSloTableData,
        addUser,
        editUser,
        deleteUser,
      }}
    >
      {children}
    </CreateApplicationContext.Provider>
  );
};

export default CreateApplicationProvider;

// eslint-disable-next-line react-refresh/only-export-components
export const useCreateApplication = () => {
  return useContext(CreateApplicationContext);
};
