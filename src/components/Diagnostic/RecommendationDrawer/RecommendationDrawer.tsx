import React, { useState, useEffect } from "react";
import { Divider, Flex } from "antd";
import { Button, Text } from "components";
import { Colors, Metrics } from "themes";
import useDiagnosticService from "services/diagnostic.service";

import "./recommendationDrawer.styles.scss";

interface RecommendationDrawerProps {
  data: {
    recommendationId?: number;
    name?: string;
    envName?: string;
    description: string;
    cost: number;
    optimizationType: {
      changes: number;
      type: string;
    };
    recommendationStatus: "NotImplemented" | "Implemented" | undefined;
    changesRequired: string[];
    is_action_taken: boolean;
  };
  onClick?: () => void;
}

const RecommendationDrawer: React.FC<RecommendationDrawerProps> = ({
  
  data,
  onClick = () => {},
}) => {
  const { postResiliencyUpdateActionTaken } = useDiagnosticService();

  const [appliedLocal, setAppliedLocal] = useState(false);
  const [loading, setLoading] = useState(false);
  console.log("Drawer record", {
  id: data.recommendationId,
  is_action_taken: data.is_action_taken,
  name: data.name,
  des: data.description
});
  // Reset local state when data changes (e.g., switching records)
  useEffect(() => {
    setAppliedLocal(false);
    setLoading(false);
  }, [data.recommendationId]);

  // Show applied if either the prop or local state is true
  const applied = data.is_action_taken || appliedLocal;

  const handleApply = async () => {
    setLoading(true);
    try {
      const recommendation_id = String(data.recommendationId ?? "");
      const recommendation_type = "Resilience Recommendation";
      const component_name = data.name;

      const payload: any = {
        recommendation_id,
        recommendation_type,
        is_action_taken: true,
      };

      if (recommendation_type === "Resilience Recommendation" && component_name) {
        payload.component_name = component_name;
      }

      const payloadArray = [payload];

      await postResiliencyUpdateActionTaken(payloadArray);

      setAppliedLocal(true); // Optimistically update UI
    } catch (e: any) {
      alert("Failed to mark as applied. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex vertical gap={Metrics.SPACE_XL} className="recommendation-drawer">
      {data.name && (
        <Flex vertical gap={Metrics.SPACE_XS}>
          <Text
            text="Component Name"
            type="footnote"
            weight="semibold"
            color={Colors.COOL_GRAY_9}
          />
          <Text text={data.name} />
        </Flex>
      )}

      {data.envName && (
        <Flex vertical gap={Metrics.SPACE_XS}>
          <Text
            text="Environment Name"
            type="footnote"
            weight="semibold"
            color={Colors.COOL_GRAY_9}
          />
          <Text text={data.envName} />
        </Flex>
      )}

      <Flex vertical gap={Metrics.SPACE_XS}>
        <Text
          text="Description"
          type="footnote"
          weight="semibold"
          color={Colors.COOL_GRAY_9}
        />
        <Text text={data.description} />
      </Flex>

      <Flex vertical gap={Metrics.SPACE_XS}>
        <Text
          text="Change in Cost"
          type="footnote"
          weight="semibold"
          color={Colors.COOL_GRAY_9}
        />
        <Text
          text={`+ $ ${data.cost}`}
          type="cardtitle"
          weight="semibold"
          color={Colors.COOL_GRAY_12}
        />
      </Flex>

      <Flex vertical gap={Metrics.SPACE_XS}>
        <Text
          text="Optimisation Type"
          type="footnote"
          weight="semibold"
          color={Colors.COOL_GRAY_9}
        />
        <Text text={data?.optimizationType?.type} />
      </Flex>

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
        style={
          applied
            ? { backgroundColor: Colors.POLAR_GREEN_2, width: "fit-content" }
            : { width: "fit-content" }
        }
        disabled={applied || loading}
        onClick={!applied && !loading ? handleApply : undefined}
      />

      <Divider />

      {data?.changesRequired?.length > 0 && (
        <Flex vertical gap={Metrics.SPACE_XS}>
          <Text
            text="Changes"
            type="footnote"
            weight="semibold"
            color={Colors.COOL_GRAY_9}
          />
          <ul>
            {data?.changesRequired?.map((change, idx) => (
              <li key={idx}>
                <Text text={change} />
              </li>
            ))}
          </ul>
        </Flex>
      )}
    </Flex>
  );
};

export default RecommendationDrawer;
