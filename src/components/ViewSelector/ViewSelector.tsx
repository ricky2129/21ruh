import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { PlusOutlined, RightOutlined } from "@ant-design/icons";
import { Flex } from "antd";

import { Button, IconViewer } from "components";

import { Colors, Metrics } from "themes";

import "./ViewSelector.styles.scss";

type View = {
  id: string;
  name: string;
};

interface ViewSelectorProps {
  views: View[];
  type: "Environment" | "Repositories" | "Experiments";
  onClickAddNew: () => void;
  onChange: (view: View) => void;
  disableAddNew?: boolean;
}

const ViewSelector: React.FC<ViewSelectorProps> = ({
  views = [],
  type = "",
  disableAddNew,
  onClickAddNew,
  onChange,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get("view");

  const viewContainerRef = useRef(null);
  const [activeId, setActiveId] = useState<string>(id);
  const [isOvertaking, setIsOverflowing] = useState<boolean>(false);

  useEffect(() => {
    const el = viewContainerRef.current;
    if (el.offsetWidth < el.scrollWidth) {
      setIsOverflowing(true);
    }
  }, []);

  useEffect(() => {
    onChange(views?.find((view) => view.id === id) || views?.[0]);
  }, [activeId]);

  useEffect(() => {
    if (id) {
      setActiveId(id);
    } else if (views?.length > 0) {
      setSearchParams({ view: views?.[0].id });
    }
  }, [onChange, searchParams, id, views, activeId]);

  const handleScroll = () => {
    const el = viewContainerRef.current as HTMLElement;

    el.scrollBy(Math.min(el.scrollWidth - el.offsetWidth, 50), 0);
  };

  return (
    <Flex
      align="center"
      className="view-selector-container"
      justify="space-between"
      gap={Metrics.SPACE_MD}
    >
      <Flex
        align="center"
        gap={Metrics.SPACE_SM}
        className="view-btn-container"
        ref={viewContainerRef}
      >
        {views?.map((view) => (
          <Button
            title={view.name}
            onClick={() => setSearchParams({ view: view.id })}
            type={activeId === view.id ? "primary" : "text"}
            size="middle"
            customClass={`${activeId === view.id && "selected-tab-btn"} semibold`}
            key={view.id}
          />
        ))}
      </Flex>
      <Flex gap={Metrics.SPACE_SM} align="center">
        {isOvertaking && (
          <span className="right-arrow-container">
            <IconViewer
              Icon={RightOutlined}
              width={18}
              height={18}
              customClass="right-arrow"
              onClick={handleScroll}
            />
          </span>
        )}
        <Button
          title={`Add New ${type}`}
          onClick={onClickAddNew}
          icon={<IconViewer Icon={PlusOutlined} color={Colors.WHITE} />}
          size="middle"
          disabled={disableAddNew}
        />
      </Flex>
    </Flex>
  );
};

export default ViewSelector;
