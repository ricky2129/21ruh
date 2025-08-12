import React, { useEffect } from "react";
import { Form, FormInstance, Button, message, Flex, Select, Input as AntInput } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Input, Text } from "components";
import { Metrics } from "themes";
import { useNavigate, useParams } from "react-router-dom";
import { 
  useConnectToAWS,
  type ConnectAWSRequest
} from "react-query/driftAssistQueries";

// AWS Regions from original project
const AWS_REGIONS = [
  { label: "US East (N. Virginia) - us-east-1", value: "us-east-1" },
  { label: "US East (Ohio) - us-east-2", value: "us-east-2" },
  { label: "US West (N. California) - us-west-1", value: "us-west-1" },
  { label: "US West (Oregon) - us-west-2", value: "us-west-2" },
  { label: "Europe (Ireland) - eu-west-1", value: "eu-west-1" },
  { label: "Europe (London) - eu-west-2", value: "eu-west-2" },
  { label: "Europe (Frankfurt) - eu-central-1", value: "eu-central-1" },
  { label: "Asia Pacific (Singapore) - ap-southeast-1", value: "ap-southeast-1" },
  { label: "Asia Pacific (Sydney) - ap-southeast-2", value: "ap-southeast-2" },
  { label: "Asia Pacific (Tokyo) - ap-northeast-1", value: "ap-northeast-1" },
];

interface ConfigureDriftAssistFormField {
  CLOUD_PROVIDER: string;
  AWS_ACCESS_KEY: string;
  AWS_SECRET_KEY: string;
  AWS_REGION: string;
}

interface ConfigureDriftAssistProps {
  configureDriftAssistForm: FormInstance<ConfigureDriftAssistFormField>;
  setDisabledSave: (disabled: boolean) => void;
  onFinish?: () => void;
}

const ConfigureDriftAssist: React.FC<ConfigureDriftAssistProps> = ({
  configureDriftAssistForm,
  setDisabledSave,
  onFinish,
}) => {
  const navigate = useNavigate();
  const { project, application } = useParams();

  // API hooks
  const connectToAWSMutation = useConnectToAWS();

  // Form validation
  useEffect(() => {
    const hasErrors = configureDriftAssistForm
      ?.getFieldsError()
      .filter(({ errors }) => errors.length).length > 0;
    setDisabledSave(hasErrors);
  }, [configureDriftAssistForm, setDisabledSave]);

  // Initialize form with defaults
  useEffect(() => {
    configureDriftAssistForm.setFieldsValue({
      CLOUD_PROVIDER: 'aws',
      AWS_REGION: 'us-east-1'
    });
  }, [configureDriftAssistForm]);

  const handleConnectToAWS = async () => {
    try {
      const values = await configureDriftAssistForm.validateFields();
      
      const connectRequest: ConnectAWSRequest = {
        provider: values.CLOUD_PROVIDER,
        credentials: {
          access_key: values.AWS_ACCESS_KEY,
          secret_key: values.AWS_SECRET_KEY,
        },
        region: values.AWS_REGION,
      };

      const response = await connectToAWSMutation.mutateAsync(connectRequest);
      
      message.success('Successfully connected to AWS!');
      
      // Navigate to workflows section with sessionId
      navigate(`/project/${project}/application/${application}/workflow`, {
        state: {
          sessionId: response.session_id,
          awsCredentials: {
            region: values.AWS_REGION,
            provider: values.CLOUD_PROVIDER
          }
        }
      });

      if (onFinish) onFinish();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to connect to AWS');
    }
  };

  return (
    <Flex vertical gap={Metrics.SPACE_LG}>
      <Form
        form={configureDriftAssistForm}
        layout="vertical"
        onFinish={handleConnectToAWS}
        initialValues={{ 
          CLOUD_PROVIDER: 'aws', 
          AWS_REGION: 'us-east-1'
        }}
      >
        {/* AWS Credentials */}
        <div style={{ marginBottom: 24 }}>
          <Text text="Connect to AWS" weight="semibold" style={{ fontSize: '16px', marginBottom: '12px', display: 'block' }} />
          
          <Form.Item
            label={<Text text="Cloud Provider" weight="semibold" />}
            name="CLOUD_PROVIDER"
            rules={[{ required: true, message: 'Cloud provider is required' }]}
          >
            <Select
              placeholder="Select cloud provider"
              options={[{ label: "Amazon Web Services (AWS)", value: "aws" }]}
            />
          </Form.Item>

          <Form.Item
            label={<Text text="AWS Access Key" weight="semibold" />}
            name="AWS_ACCESS_KEY"
            rules={[
              { required: true, message: 'AWS Access Key is required' },
              { pattern: /^AKIA[0-9A-Z]{16}$/, message: 'Invalid AWS Access Key format (should start with AKIA)' }
            ]}
          >
            <Input
              placeholder="AKIA..."
              autoComplete="off"
            />
          </Form.Item>

          <Form.Item
            label={<Text text="AWS Secret Key" weight="semibold" />}
            name="AWS_SECRET_KEY"
            rules={[
              { required: true, message: 'AWS Secret Key is required' },
              { len: 40, message: 'AWS Secret Key should be exactly 40 characters long' }
            ]}
          >
            <AntInput.Password
              placeholder="Enter your AWS Secret Access Key"
              autoComplete="off"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item
            label={<Text text="AWS Region" weight="semibold" />}
            name="AWS_REGION"
            rules={[{ required: true, message: 'AWS region is required' }]}
          >
            <Select
              placeholder="Select AWS region"
              options={AWS_REGIONS}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item>
            <Flex justify="end">
              <Button
                type="primary"
                htmlType="submit"
                loading={connectToAWSMutation.isPending}
                style={{ marginTop: 16 }}
              >
                Connect to AWS & Continue
              </Button>
            </Flex>
          </Form.Item>
        </div>

        {/* Security Notice */}
        <div style={{ marginTop: 24, padding: '12px', background: '#e7f3ff', border: '1px solid #b3d9ff', borderRadius: '4px' }}>
          <Text 
            text="🔒 Security Notice: Your credentials are used only for validation and are not stored permanently. They are kept in memory for the duration of your session only." 
            type="footnote" 
            style={{ color: '#0066cc' }}
          />
        </div>
      </Form>
    </Flex>
  );
};

export default ConfigureDriftAssist;
