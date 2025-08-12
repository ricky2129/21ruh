import React from "react";
import { useParams } from "react-router-dom";
import { ProjectMembers } from "./ProjectMembers";

const ProjectMembersRouteWrapper: React.FC = () => {
  const { project } = useParams<{ project: string }>();
  const projectIdNumber = Number(project);
  if (!project || isNaN(projectIdNumber)) {
    return <div>Invalid or missing project ID</div>;
  }
  return <ProjectMembers projectId={projectIdNumber} />;
};

export default ProjectMembersRouteWrapper;