import { useMemo, useState } from "react";

import { SearchOutlined } from "@ant-design/icons";
import { Flex, Select } from "antd";

import { IconViewer, Input } from "components";

import { Colors, Metrics } from "themes";

import "./selectWithSearch.styles.scss";

interface option {
  label: string;
  value: string | number;
}
interface SelectWithSearchProps {
  options: option[];
  selectedValue: string | number;
  onSelect?: (value: string | number) => void;
}

const SelectWithSearch: React.FC<SelectWithSearchProps> = ({
  options,
  selectedValue,
  onSelect,
}) => {
  const [search, setSearch] = useState<string>("");

  const filteredOptions = useMemo(() => {
    if (!options || !options.length)  return [];
    
    return options?.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase()),
    );
  }, [options, search]);

  return (
    <Select
      options={filteredOptions}
      value={selectedValue}
      variant="borderless"
      popupMatchSelectWidth={false}
      rootClassName="select-with-search semibold"
      onSelect={(value) => onSelect(value)}
      onBlur={() => setSearch("")}
      dropdownRender={(menu) => (
        <Flex vertical gap={Metrics.SPACE_XS} className="dropdown-container">
          <Input
            placeholder="Search"
            prefix={
              <IconViewer Icon={SearchOutlined} color={Colors.COOL_GRAY_2} />
            }
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
          {menu}
        </Flex>
      )}
    />
  );
};

export default SelectWithSearch;
