import React, { useMemo, useState, useEffect } from "react";
import { Col, Row } from "antd";
import { Project } from "interfaces";
import { ProjectCard } from "../ProjectCard";
import "./projectList.styles.scss";

interface ProjectListProps {
  projects: Project[];
  loading: boolean;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  loading,
}: ProjectListProps) => {
  const [projectList, setProjectList] = useState<Project[]>(projects);

  useEffect(() => {
    setProjectList(projects);
  }, [projects]);

  const projectsToDisplay: Array<Project | number> = useMemo(() => {
    const mockProjects = Array(10)
      .fill(0)
      .map((_, i) => i + 1);
    return loading ? mockProjects : projectList;
  }, [loading, projectList]);

  const handleDelete = (id: number | string) => {
    setProjectList((prev) => prev.filter((proj) => proj.id !== id));
  };

  // Update a project in the list after edit
  const handleProjectUpdate = (updatedProject: Project) => {
    setProjectList((prev) =>
      prev.map((proj) =>
        proj.id === updatedProject.id ? { ...proj, ...updatedProject } : proj
      )
    );
  };

  return (
    <Row gutter={[16, 16]}>
      {projectsToDisplay?.map((project: Project | number, index) => (
        <Col key={index} xl={6} lg={8} md={12} sm={24}>
          {typeof project === "object" ? (
            <ProjectCard
              data={project}
              loading={loading}
              onDelete={handleDelete}
              onProjectUpdate={handleProjectUpdate}
            />
          ) : (
            // Skeleton or placeholder for loading state
            <div className="project-card-skeleton" />
          )}
        </Col>
      ))}
    </Row>
  );
};

export default ProjectList;
