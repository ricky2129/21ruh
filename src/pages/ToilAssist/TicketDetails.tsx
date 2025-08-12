import React, { useState } from "react";
import {
  useGetTicket,
  useGetTicketRunbook,
  useApproveRemediation,
  useDeclineRemediation,
} from "react-query/toilAssistQueries";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import "./TicketDetails.styles.scss";

const TicketDetails = ({ ticketKey, onBack }) => {
  const {
    data: ticketData,
    isLoading: isTicketLoading,
    error: ticketError,
  } = useGetTicket(ticketKey);
  const {
    data: runbookData,
    isLoading: isRunbookLoading,
    error: runbookError,
  } = useGetTicketRunbook(ticketKey);

  const {
    mutateAsync: approveAsync,
    isLoading: isApproveLoading,
  } = useApproveRemediation();

  const {
    mutateAsync: declineAsync,
    isLoading: isDeclineLoading,
  } = useDeclineRemediation();

  const [actionMessage, setActionMessage] = useState("");
  const [actionType, setActionType] = useState("");

  if (isTicketLoading || isRunbookLoading) {
    return <div className="ticketdetails-container">Loading...</div>;
  }

  if (ticketError || runbookError) {
    return (
      <div className="ticketdetails-container">
        Error loading ticket details.
      </div>
    );
  }

  if (!ticketData || !ticketData.fields) {
    return (
      <div className="ticketdetails-container">No ticket data found.</div>
    );
  }

  const fields = ticketData.fields;
  const comments = fields.comment?.comments || [];

  const statusName = fields.status?.name?.toLowerCase();
  const isDone = statusName === "done";
  const isToDo = statusName === "to do";

  const renderRunbook = (runbook) => {
    if (!runbook || Object.keys(runbook).length === 0) {
      return "No runbook available";
    }
    return (
      <div className="ticketdetails-card">
        {runbook.verification_explanation && (
          <div style={{ marginBottom: 8 }}>
            <strong>Verification Explanation:</strong>
            <div>{runbook.verification_explanation}</div>
          </div>
        )}
        {runbook.verification_commands && (
          <div style={{ marginBottom: 8 }}>
            <strong>Verification Commands:</strong>
            <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {runbook.verification_commands}
            </pre>
          </div>
        )}
        {runbook.remediation_explanation && (
          <div style={{ marginBottom: 8 }}>
            <strong>Remediation Explanation:</strong>
            <div>{runbook.remediation_explanation}</div>
          </div>
        )}
        {runbook.remediation_command && (
          <div style={{ marginBottom: 8 }}>
            <strong>Remediation Command:</strong>
            <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {runbook.remediation_command}
            </pre>
          </div>
        )}
        {runbook.post_check_explanation && (
          <div style={{ marginBottom: 8 }}>
            <strong>Post Check Explanation:</strong>
            <div>{runbook.post_check_explanation}</div>
          </div>
        )}
        {runbook.post_check_command && (
          <div style={{ marginBottom: 8 }}>
            <strong>Post Check Command:</strong>
            <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {runbook.post_check_command}
            </pre>
          </div>
        )}
      </div>
    );
  };

  const handleApprove = async () => {
    setActionMessage("");
    setActionType("");
    try {
      await approveAsync(ticketKey);
      setActionType("approve");
      setActionMessage("Remediation approved successfully.");
    } catch (err) {
      setActionType("approve");
      setActionMessage(
        "Failed to approve remediation"
      );
    }
  };

  const handleDecline = async () => {
    setActionMessage("");
    setActionType("");
    try {
      await declineAsync(ticketKey);
      setActionType("decline");
      setActionMessage("Remediation declined successfully.");
    } catch (err) {
      setActionType("decline");
      setActionMessage(
        "Failed to decline remediation"
      );
    }
  };

  function extractAlertSummary(description) {
  if (!description) return "N/A";
  const match = description.match(/\*Alert Summary:\*\s*(.*)/);
  return match ? match[1].trim() : "N/A";
}

  return (
    <div className="ticketdetails-container" style={{ position: "relative" }}>
      <div className="ticketdetails-header">
        <div className="ticketdetails-title">{ticketData.key || "No Key"}</div>
        <div className="ticketdetails-buttons">
          {isDone ? (
            <button className="ticketdetails-button approved" disabled>
              <FontAwesomeIcon icon={faCheck} /> Approved
            </button>
          ) : isToDo ? (
            <>
              <button
                className="ticketdetails-button approve"
                onClick={handleApprove}
                disabled={isApproveLoading || isDeclineLoading}
                title="Approve Remediation"
              >
                {isApproveLoading ? (
                  "Approving..."
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheck} /> Approve
                  </>
                )}
              </button>
              <button
                className="ticketdetails-button decline"
                onClick={handleDecline}
                disabled={isApproveLoading || isDeclineLoading}
                title="Decline Remediation"
              >
                {isDeclineLoading ? (
                  "Declining..."
                ) : (
                  <>
                    <FontAwesomeIcon icon={faTimes} /> Decline
                  </>
                )}
              </button>
            </>
          ) : null}
        </div>
      </div>
      {actionMessage && (
        <div
          style={{
            margin: "12px 0",
            color: actionMessage.includes("successfully")
              ? actionType === "approve"
                ? "green"
                : "orange"
              : "red",
            fontWeight: "bold",
          }}
        >
          {actionMessage}
        </div>
      )}
      <div className="ticketdetails-content">
        <div className="ticketdetails-section">
          <div className="ticketdetails-label">Summary:</div>
          <div className="ticketdetails-value">{fields.summary || "N/A"}</div>
        </div>
        <div className="ticketdetails-section">
            <div className="ticketdetails-label">Description:</div>
            <div className="ticketdetails-value">
                {extractAlertSummary(fields.description)}
            </div>
        </div>
        <div className="ticketdetails-section">
          <div className="ticketdetails-label">Status:</div>
          <div className="ticketdetails-value">
            {fields.status?.name || "N/A"}
          </div>
        </div>
        <div className="ticketdetails-section">
          <div className="ticketdetails-label">Priority:</div>
          <div className="ticketdetails-value">
            {fields.priority?.name || "N/A"}
          </div>
        </div>
        <div className="ticketdetails-section">
          <div className="ticketdetails-label">Issue Type:</div>
          <div className="ticketdetails-value">
            {fields.issuetype?.name || "N/A"}
          </div>
        </div>
        <div className="ticketdetails-section">
          <div className="ticketdetails-label">Project:</div>
          <div className="ticketdetails-value">
            {fields.project?.name || "N/A"}
          </div>
        </div>
        <div className="ticketdetails-section">
          <div className="ticketdetails-label">Creator:</div>
          <div className="ticketdetails-value">
            {fields.creator?.displayName || "N/A"}
          </div>
        </div>
        <div className="ticketdetails-section">
          <div className="ticketdetails-label">Reporter:</div>
          <div className="ticketdetails-value">
            {fields.reporter?.displayName || "N/A"}
          </div>
        </div>
        <div className="ticketdetails-section">
          <div className="ticketdetails-label">Runbook:</div>
          <div className="ticketdetails-value">{renderRunbook(runbookData)}</div>
        </div>
        <div className="ticketdetails-section">
          <div className="ticketdetails-label">Comments:</div>
          <div className="ticketdetails-value">
            <div className="ticketdetails-card">
              {comments.length > 0 ? (
                comments.map((comment, idx) => (
                  <div key={idx} style={{ marginBottom: 12 }}>
                    <strong>
                      {comment.author?.displayName || "Unknown"}:
                    </strong>{" "}
                    {comment.body || "No comment"}{" "}
                    <em>
                      (
                      {comment.created
                        ? new Date(comment.created).toLocaleString()
                        : "N/A"}
                      )
                    </em>
                  </div>
                ))
              ) : (
                "No comments"
              )}
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={onBack}
        className="ticketdetails-button back"
        style={{ marginTop: 24 }}
      >
        Back
      </button>
    </div>
  );
};

export default TicketDetails;
