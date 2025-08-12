import React, { useMemo, useState, useEffect } from "react";
import { Col, Row } from "antd";
import { Application } from "interfaces";
import { ApplicationCard } from "components";

interface ApplicationListProps {
  applications: Application[];
  loading: boolean;
}

const ApplicationList: React.FC<ApplicationListProps> = ({
  applications,
  loading,
}: ApplicationListProps) => {
  const [applicationList, setApplicationList] = useState<Application[]>(applications);

  useEffect(() => {
    setApplicationList(applications);
  }, [applications]);

  const applicationsToDisplay: Array<Application | number> = useMemo(() => {
    const mockApplications = Array(10)
      .fill(0)
      .map((_, i) => i + 1);
    return loading ? mockApplications : applicationList;
  }, [loading, applicationList]);

  const handleDelete = (id: number | string) => {
    setApplicationList((prev) =>
      prev.filter((app) => app.id === id || app.id === Number(id) ? false : true)
    );
  };

  return (
    <Row gutter={[16, 16]}>
      {applicationsToDisplay?.map((application: Application | number, index) => (
        <Col key={index} xl={6} lg={8} md={12} sm={24}>
          {typeof application === "object" ? (
            <ApplicationCard
              data={application}
              loading={loading}
              onDelete={handleDelete}
            />
          ) : (
            <div className="application-card-skeleton" />
          )}
        </Col>
      ))}
    </Row>
  );
};

export default ApplicationList;
