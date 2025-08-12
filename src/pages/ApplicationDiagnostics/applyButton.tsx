import React, { useState, useEffect } from "react";
import { Button, Text } from "components";
import { Colors } from "themes";
import { useDiagnosticService } from "services";

type ApplyButtonProps = {
  recommendation_id: string;
  recommendation_type: string;
  component_name?: string;
  is_action_taken: boolean;
  serviceEnvId: number;
  refetch: () => Promise<any>;
};

const ApplyButton: React.FC<ApplyButtonProps> = ({
  recommendation_id,
  recommendation_type,
  component_name,
  is_action_taken,
  serviceEnvId,
  refetch,
}) => {
  const [applied, setApplied] = useState(is_action_taken);
  const [loading, setLoading] = useState(false);

  const { postResiliencyUpdateActionTaken } = useDiagnosticService();

  useEffect(() => {
    setApplied(is_action_taken);
  }, [is_action_taken]);

  const handleApply = async () => {
    setLoading(true);
    try {
      const payload: any = {
        recommendation_id,
        recommendation_type,
        is_action_taken: true,
      };
      if (
        recommendation_type === "Resilience Recommendation" &&
        component_name
      ) {
        payload.component_name = component_name;
      }
      const payloadArray = [payload];

      await postResiliencyUpdateActionTaken(payloadArray);

      setApplied(true);

      // Call refetch to update parent diagnostics data
      await refetch();
    } catch (e: any) {
      alert("Failed to mark as applied. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      title={
        applied ? (
          <Text
            text="Applied"
            weight="semibold"
            color={Colors.PRIMARY_GREEN_600}
          />
        ) : loading ? (
          <Text
            text="Applying..."
            weight="semibold"
            color={Colors.PRIMARY_GREEN_600}
          />
        ) : (
          "Mark it as Applied"
        )
      }
      type="primary"
      shape={applied ? "round" : undefined}
      size="middle"
      fullWidth
      style={applied ? { backgroundColor: Colors.POLAR_GREEN_2 } : {}}
      onClick={applied || loading ? undefined : handleApply}
      disabled={applied || loading}
    />
  );
};

export default ApplyButton;
