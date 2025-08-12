import { Fragment } from "react/jsx-runtime";

import { PlusOutlined } from "@ant-design/icons";

import { Button, Empty, IconViewer, Loading } from "components";

import { useAppNavigation } from "context";

import { Colors, Metrics } from "themes";

const HealthChecks: React.FC = () => {
  const { isLoading } = useAppNavigation();

  const healthChecks = [];

  const openAddNewRepository = () => {};

  if (isLoading) <Loading size="large" />;

  return (
    <Fragment>
      {healthChecks?.length === 0 ? (
        <Empty
          title="You have not added any Health Checks yet"
          subtitle='Please click “Add New Health Checks " button to get stated with.'
        >
          <Button
            title={`Add New Health Checks`}
            icon={
              <IconViewer
                Icon={PlusOutlined}
                color={Colors.WHITE}
                size={Metrics.SPACE_MD}
              />
            }
            size="middle"
            onClick={openAddNewRepository}
          />
        </Empty>
      ) : (
        ""
      )}
    </Fragment>
  );
};

export default HealthChecks;
