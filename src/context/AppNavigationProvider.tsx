import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  useAddServiceToApplication,
  useGetApplicationDetails,
} from "react-query/applicationQueries";
import { useGetProjectDetails } from "react-query/projectQueries";
import {
  Params,
  useLocation,
  useMatches,
  useNavigate,
  useParams,
} from "react-router-dom";

import { SidenavMenu, SidenavMenuMap } from "constant";
import {
  AppServiceMap,
  AppServiceType,
  ApplicationDetails,
  MenuItem,
  Project,
  SidebarMenu,
  SidenavList,
  SidenavType,
} from "interfaces";

import { IconViewer } from "components";

import { Colors, Metrics } from "themes";

interface ContextState {
  children: React.ReactNode;
}

interface IAppNavigationContext {
  isSidebarCollapsed: boolean;
  sidenavMenu: SidebarMenu;
  selectedMenuKey: string;
  project: Project;
  application: ApplicationDetails;
  isLoading: boolean;
  setSidebarCollapsed: (isCollapsed: boolean) => void;
  onNavigate: (key: string) => void;
  getServiceId: (service: AppServiceType) => Promise<number>;
  refetchApplicationDetails: () => Promise<ApplicationDetails>;
}

const initialValue = {
  isSidebarCollapsed: true,
  sidenavMenu: {} as SidebarMenu,
  selectedMenuKey: "1",
  project: {} as Project,
  application: {} as ApplicationDetails,
  isLoading: false,
  setSidebarCollapsed: () => {},
  onNavigate: () => {},
  getServiceId: () => {
    return Promise.resolve(0);
  },
  refetchApplicationDetails: () => {
    return Promise.resolve({} as ApplicationDetails);
  },
};

const AppNavigationContext = createContext<IAppNavigationContext>(initialValue);

interface IMatches {
  id: string;
  pathname: string;
  params: Params<string>;
  data: unknown;
  handle: unknown;
}

type HandleType = {
  menu: (match?: IMatches) => { menu: string; key: string };
};

const AppNavigationProvider = ({ children }: ContextState) => {
  const navigate = useNavigate();
  const params = useParams();
  const { pathname } = useLocation();
  const matches: IMatches[] = useMatches();

  const getApplicationDetailsQuery = useGetApplicationDetails(
    params?.application || "",
  );
  const getProjectDetailsQuery = useGetProjectDetails(params?.project || "");
  const addServiceToApplicationQuery = useAddServiceToApplication();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false); // TODO: get from local storage
  const [sidenavMenuType, setSidenavMenuType] = useState<string>(
    SidenavType.HOME,
  );
  const [sidenavMenu, setSidenavMenu] = useState<SidebarMenu>(
    {} as SidebarMenu,
  );
  const [selectedMenuKey, setSelectedMenuKey] = useState<string>("1");

  const setSidebarCollapsed = useCallback((state: boolean) => {
    setIsSidebarCollapsed(state);
  }, []);

  /**
   * Navigate to the selected menu item and update the selected menu key.
   * Replace any route params with the actual params from the URL.
   * @param key The key of the selected menu item.
   */
  const onNavigate = useCallback(
    (key: string) => {
      const sidenavList: SidenavList = SidenavMenuMap[sidenavMenuType];
      const menu = sidenavList.menu.find((item) => item.key === key);

      if (menu.route) {
        let url = menu.route;
        Object.keys(params).forEach((key) => {
          url = url.replace(`:${key}`, params[key]);
        });

        navigate(url);
      }
    },
    [navigate, params, sidenavMenuType],
  );

  /**
   * Updates the sidenav type and updates the default selected menu key accordingly.
   * @param {string} sidenavType The type of the sidenav.
   */
  const setSidenavType = useCallback((sidenavType: string) => {
    const sidenavList = SidenavMenuMap[sidenavType];
    setSidenavMenuType(sidenavType);

    // Set the sidenav menu
    const menu: MenuItem[] = sidenavList?.menu.map(({ key, icon, label }) => {
      return {
        key,
        label,
        title: "",
        icon: (
          <IconViewer
            Icon={icon}
            size={Metrics.SIDEBAR_ICON_SIZE}
            color={Colors.COOL_GRAY_11}
            customClass="ant-menu-item-icon"
          />
        ),
      };
    });
    setSidenavMenu({ title: sidenavList.title, menu });
  }, []);

  const getServiceId = useCallback(
    async (service: AppServiceType) => {
      const application = getApplicationDetailsQuery.data;
      const existingService = application?.services?.find(
        (s) => s.service == service,
      );
      if (application && existingService) {
        return existingService.id;
      }

      const res = await addServiceToApplicationQuery.mutateAsync({
        application_id: application.id,
        service_id: AppServiceMap[service],
      });
      await getApplicationDetailsQuery.refetch();

      return res.app_service_id;
    },
    [addServiceToApplicationQuery, getApplicationDetailsQuery],
  );

  /**
   * Sets the selected menu key to the default key for the current path.
   * Used to highlight the current page in the sidenav.
   */
  useEffect(() => {
    if (
      params?.application &&
      params?.application !== getApplicationDetailsQuery?.data?.id?.toString()
    )
      getApplicationDetailsQuery.refetch();

    if (
      params?.project &&
      params?.project !== getProjectDetailsQuery?.data?.id?.toString()
    )
      getProjectDetailsQuery.refetch();

    const matchedMenu =
      matches
        .filter((match) =>
          Boolean(match.handle && (match.handle as HandleType).menu),
        )
        .map((match) => {
          return (match.handle as HandleType).menu(match);
        })
        .at(-1) || SidenavMenu.HOME_PORTFOLIO;

    setSidenavMenuType(matchedMenu.menu);
    setSidenavType(matchedMenu.menu);

    setSelectedMenuKey(matchedMenu.key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, setSidenavType]);

  return (
    <AppNavigationContext.Provider
      value={{
        isSidebarCollapsed,
        sidenavMenu,
        selectedMenuKey,
        project: getProjectDetailsQuery?.data,
        application: getApplicationDetailsQuery?.data,
        isLoading:
          addServiceToApplicationQuery.isLoading ||
          getProjectDetailsQuery.isLoading ||
          getApplicationDetailsQuery.isLoading,
        setSidebarCollapsed,
        onNavigate,
        getServiceId,
        refetchApplicationDetails: async (): Promise<ApplicationDetails> => {
          return (await getApplicationDetailsQuery.refetch()).data;
        },
      }}
    >
      {children}
    </AppNavigationContext.Provider>
  );
};

export default AppNavigationProvider;

// eslint-disable-next-line react-refresh/only-export-components
export const useAppNavigation = () => {
  return useContext(AppNavigationContext);
};
