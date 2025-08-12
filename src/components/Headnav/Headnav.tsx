import { useGetApplications, useGetProjects } from "react-query";
import {
  Link,
  Params,
  useMatches,
  useNavigate,
  useParams,
} from "react-router-dom";

import { SettingOutlined } from "@ant-design/icons";
import { Breadcrumb, Flex } from "antd";
import { RouteUrl } from "constant";
import { resolveUrlParams } from "helpers";

import OrganizationBlock from "assets/organization.svg";

import { IconViewer } from "components/IconViewer";
import { SelectWithSearch } from "components/SelectWithSearch";
import { Text } from "components/Text";

import { useAppNavigation } from "context";

import { Colors, Metrics } from "themes";

import "./headernav.styles.scss";

interface IMatches {
  id: string;
  pathname: string;
  params: Params<string>;
  data: unknown;
  handle: unknown;
}

type HandleType = {
  crumb: (match?: IMatches) => string;
};

const Headnav: React.FC = () => {
  const matches: IMatches[] = useMatches();
  const params = useParams();
  const navigate = useNavigate();

  const getApplicationsQuery = useGetApplications(parseInt(params?.project));
  const getProjectQuery = useGetProjects();
  const crumbs = matches
    .filter((match) =>
      Boolean(match.handle && (match.handle as HandleType).crumb),
    )
    .map((match) => {
      return {
        data: (match.handle as HandleType).crumb(match),
        ref: match.pathname,
      };
    });
  const { project, application, isLoading } = useAppNavigation();

  const getCrumbValue = (data: string) => {
    switch (data) {
      case ":project":
        return isLoading ? "..." : project?.name;
      case ":application":
        return isLoading ? "..." : application?.name;
      default:
        return data;
    }
  };

  return (
    <Flex vertical className="headnav-container">
      <Flex
        className="header-container"
        gap={Metrics.SPACE_SM}
        align="center"
        justify="space-between"
      >
        <Flex align="center" gap={Metrics.SPACE_XXS}>
          <Flex vertical gap={Metrics.SPACE_XXS}>
            {params.application ? (
              <SelectWithSearch
                options={getApplicationsQuery.data?.map((data) => {
                  return {
                    label: data.name,
                    value: data.id,
                  };
                })}
                selectedValue={parseInt(params.application)}
                onSelect={(value) => {
                  navigate(
                    resolveUrlParams(RouteUrl.APPLICATIONS.DASHBOARD, {
                      project: params?.project,
                      application: value.toString(),
                    }),
                  );
                }}
              />
            ) : params.project ? (
              <>
                <SelectWithSearch
                  options={getProjectQuery.data?.map((data) => {
                    return {
                      label: data.name,
                      value: data.id,
                    };
                  })}
                  selectedValue={parseInt(params.project)}
                  onSelect={(value) => {
                    navigate(
                      resolveUrlParams(RouteUrl.PROJECTS.DASHBOARD, {
                        project: value.toString(),
                      }),
                    );
                  }}
                />
                {
                  <Text
                    text={
                      getProjectQuery.data?.find(
                        (data) => data.id === parseInt(params.project),
                      )?.visibility
                    }
                    type="footnote"
                    color={Colors.HEADNAV_TEXT_GREY}
                    weight="semibold"
                  />
                }
              </>
            ) : (
              <Text
                text={getCrumbValue(crumbs[crumbs.length - 1].data)}
                type="subtitle"
                color={Colors.HEADNAV_TEXT_GREY}
                weight="semibold"
              />
            )}
          </Flex>
          {params.project && (
            <IconViewer Icon={SettingOutlined} width={20} height={20} />
          )}
        </Flex>
        <Flex gap={Metrics.SPACE_XS} align="center">
          <OrganizationBlock />
          <Text
            text="Deloitte"
            type="bodycopy"
            customClass="organisation-selected-option"
          />
        </Flex>
      </Flex>
      <Breadcrumb
        className="route-breadcrumb-container"
        items={crumbs.map(({ ref, data }, index) => ({
          title: (
            <Link to={ref}>
              <Text
                text={getCrumbValue(data)}
                type="footnote"
                weight={index === crumbs.length - 1 ? "regular" : "semibold"}
                color={Colors.HEADNAV_TEXT_GREY}
              />
            </Link>
          ),
        }))}
      />
    </Flex>
  );
};

export default Headnav;
