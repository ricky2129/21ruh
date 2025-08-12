import { useCallback, useEffect, useState } from "react";

import { Flex, Form, Table, TableColumnsType } from "antd";
import { sloFormConstants } from "constant";
import {
  SLOFormType,
  SLOTargetLevelType,
  SLOTargetUnitType,
  SLOType,
  Tag,
} from "interfaces";

import { DeleteIcon, EditIcon } from "assets";

import { Button, Drawer, IconViewer, SLOForm, Text } from "components";

import { Colors, Metrics } from "themes";

import "./projectSlo.styles.scss";

const SLOTargetColorMap: Record<SLOTargetLevelType, string> = {
  Low: Colors.BRIGHT_RED,
  Medium: Colors.BRIGHT_ORANGE,
  High: Colors.PRIMARY_GREEN_800,
};

interface SLOPropTye {
  sloTableData: SLOType[];
  addSloTableData: (data: SLOType) => void | Promise<void>;
  editSloTableData: (id: string, data: SLOType) => void | Promise<void>;
  deleteSloTableData: (id: string) => void | Promise<void>;
  hideApplicationTags?: boolean;
  isLoading?: boolean;
}

const columns: TableColumnsType<SLOType> = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    width: "30%",
    render: (name: string) => (
      <Text text={name} type="footnote" weight="semibold" />
    ),
  },
  {
    title: "KPI",
    dataIndex: "kpi",
    key: "kpi",
    width: "25%",
    render: (kpi: { title: string; subtitle?: string }) => (
      <Flex vertical>
        <Text text={kpi.title} type="footnote" weight="semibold" />
        {kpi.subtitle && (
          <Text
            text={kpi.subtitle}
            type="footnote2"
            color={Colors.COOL_GRAY_7}
          />
        )}
      </Flex>
    ),
  },
  {
    title: "Target",
    dataIndex: "target",
    key: "target",
    width: "15%",
    render: (target: { value: string; unit: string }) => (
      <Flex vertical>
        <Text
          text={target.value}
          type="footnote"
          weight="semibold"
          color={SLOTargetColorMap[target.value] as SLOTargetLevelType}
        />
        <Text text={target.unit} type="footnote2" color={Colors.COOL_GRAY_7} />
      </Flex>
    ),
  },
  {
    title: "Application tags",
    dataIndex: "application_tags",
    key: "application_tags",
    width: "20%",
    render: (application_tags: Tag[]) => (
      <div className="application-tags">
        <Text
          text={application_tags?.map((tag) => tag?.value ?? "").join(" ")}
          type="footnote"
          weight="semibold"
          ellipsis={{
            tooltip: true,
          }}
        />
      </div>
    ),
  },
  {
    title: "Action",
    dataIndex: "action",
    key: "action",
    width: "88px",
  },
];

const SLOTargetUnitMap: Record<string, SLOTargetUnitType> = {
  0: "Min",
  1: "%",
  2: "Level",
  3: "%",
  4: "Min",
};

const SLO: React.FC<SLOPropTye> = ({
  hideApplicationTags = false,
  sloTableData,
  addSloTableData,
  editSloTableData,
  deleteSloTableData,
  isLoading = false,
}) => {
  const [sloDetailsForm] = Form.useForm<SLOFormType>();

  const [open, setOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<"new" | "edit">("new");
  const [title, setTitle] = useState("");
  const [disabledSave, setDisabledSave] = useState(false);
  const [index, setIndex] = useState<string>(null);

  const { KPI } = sloFormConstants;

  const onAddNewSlo = () => {
    sloDetailsForm.resetFields();
    setDrawerType("new");
    setTitle("Add New SLO");
    setOpen(true);
  };

  const onEditSLO = (_, record: SLOType) => {
    if (isLoading) return;
    const data: SLOFormType = {
      name: record?.name,
      kpi_id: parseInt(record?.kpi.id || "0"),
      target_value: record?.target?.value?.toString(),
      target_criteria: record?.target?.criteria,
      application_tags: record?.application_tags,
    };

    sloDetailsForm.resetFields();
    sloDetailsForm.setFieldsValue(data);
    setIndex(record.key);
    setTitle("Edit SLO");
    setDrawerType("edit");
    setOpen(true);
  };

  const onDeleteSlo = (_, record: SLOType) => {
    if (isLoading) return;

    deleteSloTableData(record.key);
  };

  const handleSubmit = async () => {
    try {
      await sloDetailsForm.validateFields();

      const formData: SLOFormType = sloDetailsForm.getFieldsValue();

      const data = {
        name: formData.name,
        kpi: {
          id: formData.kpi_id.toString(),
          title: KPI.LIST.find((kpi) => kpi.VALUE === formData.kpi_id).NAME,
          subtitle:
            formData.kpi_id === 0 ? "System Reliability Score" : undefined,
        },
        target: {
          value: formData.target_value,
          unit: SLOTargetUnitMap[formData.kpi_id],
          criteria:
            SLOTargetUnitMap[formData.kpi_id] === "%"
              ? formData.target_criteria
              : undefined,
        },
        application_tags: formData.application_tags,
      } as SLOType;

      if (drawerType === "new") {
        await addSloTableData(data);
      } else if (drawerType === "edit") {
        await editSloTableData(index, data);
      }
      setOpen(false);
    } catch (err) {
      setDisabledSave(true);
      console.error(err);
    }
  };

  const sloActionRender = useCallback((text, record: SLOType) => {
    return (
      <Flex gap={Metrics.SPACE_SM} justify="center">
        <Button
          type="icon"
          icon={
            <IconViewer
              Icon={EditIcon}
              size={Metrics.SPACE_LG}
              color={Colors.PRIMARY_BLUE}
            />
          }
          disabled={isLoading}
          onClick={() => onEditSLO(text, record)}
        />
        <Button
          type="icon"
          icon={
            <IconViewer
              Icon={DeleteIcon}
              size={Metrics.SPACE_LG}
              color={Colors.BRIGHT_RED}
            />
          }
          disabled={isLoading}
          onClick={() => onDeleteSlo(text, record)}
        />
      </Flex>
    );
  }, []);

  useEffect(() => {
    if(hideApplicationTags) {
      columns[columns.length - 2].hidden = true;
    }
    columns[columns.length - 1].render = sloActionRender;
  }, [sloActionRender, hideApplicationTags]);

  return (
    <Flex vertical gap={Metrics.SPACE_LG}>
      <Flex justify="end">
        <Button title="Add New" onClick={onAddNewSlo} />
      </Flex>
      <Table<SLOType>
        columns={columns}
        dataSource={sloTableData}
        pagination={false}
        className="custom-table"
      />
      <Drawer
        title={title}
        open={open}
        disabled={disabledSave || isLoading}
        loading={isLoading}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
      >
        <SLOForm
          sloDetailsForm={sloDetailsForm}
          setDisabledSave={setDisabledSave}
          hideApplicationTags={hideApplicationTags}
        />
      </Drawer>
    </Flex>
  );
};

export default SLO;
