import { useGetApplications } from "react-query";
import { useNavigate, useParams } from "react-router-dom";

import { Flex } from "antd";
import { emptyApplicationConstants } from "constant";

import { ApplicationList, Button, Empty, Loading } from "components";

import "./application.styles.scss";

export const Application: React.FC = () => {
  const { project } = useParams();
  const navigate = useNavigate();
  const { isLoading, data } = useGetApplications(parseInt(project));

  return (
    <>
      {/* the main landing component */}
      {isLoading && <Loading />}
      <Flex gap="1rem" vertical className="landing-page-container">
        <Flex className="dlanding-application" gap="1rem" vertical>
          <Flex className="landing-application-controls" align="center">
            <Flex style={{ marginLeft: "auto" }} align="center" gap={16}>
              <Button
                size="middle"
                title="Create New Application"
                type="primary"
                onClick={() => navigate("../create-application")}
              />
            </Flex>
          </Flex>
          {!isLoading && data?.length === 0 ? (
            <Empty
              title={emptyApplicationConstants.TITLE}
              subtitle={emptyApplicationConstants.SUBTITLE}
            />
          ) : (
            <ApplicationList applications={data} loading={isLoading} />
          )}
        </Flex>
      </Flex>
    </>
  );
};
