import { customers, quickActionsByCustomer } from "./agentData.js";

// ---- helpers ----
export function nowTime() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

const has = (text, ...words) => {
  const t = text.toLowerCase();
  return words.some((w) => t.includes(w));
};

const isAngry = (text) =>
  has(
    text,
    "angry",
    "unacceptable",
    "ridiculous",
    "frustrated",
    "furious",
    "outrageous",
    "joke",
    "disgusting",
    "terrible",
    "worst",
    "fed up",
    "not fair",
    "unfair"
  );

const empathy = (text) =>
  isAngry(text)
    ? "I completely understand your frustration, and I'm truly sorry for the disruption. "
    : "";

// ---- initial greeting ----
export function getInitialGreeting(c) {
  if (c.disruptionType === "cancellation") {
    return `Hello ${c.name.split(" ")[0] === "Priya" ? "Ms. Nair" : "Mr. " + c.name.split(" ")[0]}, I'm sorry to inform you that your flight ${c.flight.number} from ${c.flight.route} on ${c.flight.date} has been cancelled due to operational reasons. As a ${c.loyaltyTier} member, you're entitled to either a full refund to your original payment method, or free rebooking on the next available flight within 24 hours with priority access. How would you like to proceed?`;
  }
  if (c.id === "arvind") {
    return `Hello Mr. Kulkarni, I'm sorry to share that your flight ${c.flight.number} from ${c.flight.route} on ${c.flight.date} has been delayed by ${c.delayHours} hours and will now depart at ${c.flight.newDeparture}. Under the applicable policy, you're eligible for a ₹500 meal voucher and lounge access. How can I assist?`;
  }
  return `Hello Ms. Kaur, I'm sorry to share that your flight ${c.flight.number} from ${c.flight.route} on ${c.flight.date} has been delayed by ${c.delayHours} hours and will now depart at ${c.flight.newDeparture}. Under the applicable policy, you're eligible for ${delayBenefitsText(c)}. As a Platinum member you also have priority rebooking. How can I assist?`;
}

function delayBenefitsText(c) {
  const parts = ["a meal voucher"];
  if (c.delayHours >= 3) parts.push("lounge access");
  if (c.delayHours > 5) parts.push("hotel accommodation covering the delayed hours");
  return parts.join(", ");
}

// ---- action-state tracking ----
// Each actionable benefit is tracked across the conversation via the `completed` map.
// State per benefit: eligible (not yet done) | completed (done, must not be re-offered).
// "unavailable" is derived from policy (e.g. hotel for a 4h delay); "escalated" from escalation state.
const benefitLabel = {
  meal: "a ₹500 meal voucher",
  lounge: "lounge access",
  hotel: "hotel accommodation covering the delayed hours",
  refund: "a full refund to your original payment method",
  rebook: "free rebooking on the next available flight within 24 hours",
};

const benefitDonePhrase = {
  meal: "Your ₹500 meal voucher has already been issued",
  lounge: "Your lounge access has already been arranged",
  hotel: "Hotel accommodation has already been arranged",
  refund: "Your refund request has already been initiated",
  rebook: "Your rebooking has already been secured",
};

function eligibleBenefits(c) {
  if (c.disruptionType === "cancellation") return ["refund", "rebook"];
  const list = ["meal"];
  if (c.delayHours >= 3) list.push("lounge");
  if (c.delayHours > 5) list.push("hotel");
  return list;
}

function pendingBenefits(c, completed) {
  return eligibleBenefits(c).filter(
    (benefit) => !isCompletedAction(completed[benefit]) && !isPendingAction(completed[benefit])
  );
}

const mutuallyExclusiveResolutionGroups = [["refund", "rebook"]];

function isCompletedAction(state) {
  return state === true || state === "completed" || state === "done" || state === "initiated";
}

function isPendingAction(state) {
  return state === "pending" || state?.status === "pending";
}

function getBlockingResolution(actionId, completed) {
  const group = mutuallyExclusiveResolutionGroups.find((actions) => actions.includes(actionId));
  if (!group) return null;
  const blockingAction = group.find(
    (candidate) =>
      candidate !== actionId &&
      (isCompletedAction(completed[candidate]) || isPendingAction(completed[candidate]))
  );
  return blockingAction || null;
}

function resolutionConflictReply(actionId, completed) {
  const blockingAction = getBlockingResolution(actionId, completed);
  if (!blockingAction) return null;
  const blockingState = completed[blockingAction];
  const statusText = isPendingAction(blockingState) ? "is still pending" : "has already been initiated";
  return `Your ${benefitLabel[blockingAction]} ${statusText}, and I can't cancel or replace it through this agent. I'm unable to proceed with ${benefitLabel[actionId]} while that resolution is in progress.`;
}

function phraseList(items, conj = "and") {
  if (!items || items.length === 0) return "";
  if (items.length === 1) return items[0];
  return items.slice(0, -1).join(", ") + ` ${conj} ` + items[items.length - 1];
}

// Tail appended after executing `exclude` benefit: acknowledge already-completed companions,
// then offer pending ones (delay only — cancellation benefits are alternatives, not cumulative).
function buildTail(c, completed, exclude) {
  const doneCompanions = eligibleBenefits(c).filter((b) => b !== exclude && isCompletedAction(completed[b]));
  let out = "";
  if (doneCompanions.length) {
    out += " " + doneCompanions.map((b) => benefitDonePhrase[b]).join(". ") + ".";
  }
  if (c.disruptionType === "delay") {
    const pending = pendingBenefits(c, completed).filter((b) => b !== exclude);
    if (pending.length) {
      out += ` You're also eligible for ${phraseList(pending.map((b) => benefitLabel[b]))} — would you like me to arrange those as well?`;
    } else {
      out += " Is there anything else I can help you with?";
    }
  } else {
    out += " Is there anything else I can help you with?";
  }
  return out;
}

// ---- initial action records when a customer is loaded ----
export function initActions(c) {
  const t = nowTime();
  const policyAction =
    c.disruptionType === "cancellation"
      ? { time: t, event: "Cancellation policy applied", status: "done" }
      : { time: t, event: `Delay compensation policy applied (${c.delayHours}h)`, status: "done" };
  return [
    { time: t, event: "Customer identified", status: "done" },
    { time: t, event: "Booking verified", status: "done" },
    { time: t, event: "Flight status verified", status: "done" },
    policyAction,
  ];
}

// ---- resolution panel ----
export function getResolution(c, completed) {
  if (c.id === "priya") {
    return {
      title: "Resolution",
      items: [
        {
          label: "Full refund",
          detail: "Original payment method · 7 business days",
          status: completed.refund ? "done" : "eligible",
        },
        {
          label: "Free rebooking",
          detail: "Next available flight within 24h · no charge",
          status: completed.rebook ? "done" : "eligible",
        },
        {
          label: "Priority rebooking",
          detail: "Gold member benefit",
          status: "eligible",
        },
        {
          label: "Additional compensation",
          detail: "Not provided beyond standard policy",
          status: "notEligible",
        },
      ],
    };
  }
  if (c.id === "arvind") {
    return {
      title: "Resolution",
      items: [
        { label: "Meal voucher", detail: "₹500", status: completed.meal ? "done" : "eligible" },
        { label: "Lounge access", detail: "During delay", status: completed.lounge ? "done" : "eligible" },
        { label: "Hotel accommodation", detail: "Only for delays over 5 hours", status: "notEligible" },
      ],
    };
  }
  // meher
  return {
    title: "Resolution",
    items: [
      { label: "Meal voucher", detail: "₹500", status: completed.meal ? "done" : "eligible" },
      { label: "Lounge access", detail: "During delay", status: completed.lounge ? "done" : "eligible" },
      {
        label: "Hotel accommodation",
        detail: "Delayed hours only (not full night)",
        status: completed.hotel ? "done" : "eligible",
      },
      { label: "Full night hotel stay", detail: "Not covered under policy", status: "notEligible" },
      { label: "Priority rebooking", detail: "Platinum member benefit", status: "eligible" },
    ],
  };
}

// ---- core response engine ----
export function generateResponse(text, c, completed) {
  const t = text.toLowerCase();
  const emp = empathy(text);
  const time = nowTime();

  // 1. Immediate escalation: legal action
  if (has(t, "legal action", "lawyer", "sue", "court", "attorney", "solicitor", "legal notice", "take you to court")) {
    return {
      reply: `${emp}I understand. Because you've indicated legal action, I'm required to escalate this immediately to a human agent who can assist you further. I won't be able to continue resolving this request automatically.`,
      actions: [
        { time, event: "Customer raised legal action", status: "escalation" },
        { time, event: "Immediate human escalation created", status: "escalation" },
      ],
      escalate: {
        type: "human",
        reason: "Customer requested legal action / formal complaint.",
      },
      complete: {},
    };
  }

  // 2. Immediate escalation: formal complaint
  if (has(t, "formal complaint", "file a complaint", "lodge a complaint", "raise a complaint", "consumer forum", "consumer court", "grievance")) {
    return {
      reply: `${emp}I understand you'd like to file a formal complaint. I'm escalating this immediately to a human agent who can handle your complaint properly. I won't continue resolving this automatically.`,
      actions: [
        { time, event: "Customer requested formal complaint", status: "escalation" },
        { time, event: "Immediate human escalation created", status: "escalation" },
      ],
      escalate: {
        type: "human",
        reason: "Customer requested legal action / formal complaint.",
      },
      complete: {},
    };
  }

  // 3. Different payment method refund → escalate
  if (has(t, "different payment", "another card", "different card", "other account", "bank account", "wallet", "upi", "different method", "another method")) {
    return {
      reply: `${emp}I'm sorry, but refunds for airline-caused cancellations can only be processed to the original payment method. I'm unable to process a refund to a different payment method and must escalate this to a human agent.`,
      actions: [
        { time, event: "Refund to alternate payment method requested", status: "escalation" },
        { time, event: "Escalation created — alternate payment method", status: "escalation" },
      ],
      escalate: {
        type: "human",
        reason: "Customer requested refund to a different payment method.",
      },
      complete: {},
    };
  }

  // 4. Fare difference waiver above ₹1,500 (Meher scenario)
  if (has(t, "waive", "fare difference", "higher fare", "higher-fare", "don't pay", "don't want to pay", "₹2000", "2000", "rs 2000", "rupees 2000")) {
    return {
      reply: `${emp}I understand you'd like to rebook on a higher-fare flight. The fare difference of ₹2,000 exceeds my authority limit of ₹1,500, so I'm unable to waive it. I'm escalating this to a supervisor for approval.`,
      actions: [
        { time, event: "Fare difference waiver requested (₹2,000)", status: "escalation" },
        { time, event: "Fare difference exceeds agent authority (₹1,500)", status: "escalation" },
        { time, event: "Supervisor approval escalation created", status: "escalation" },
      ],
      escalate: {
        type: "supervisor",
        reason: "Fare difference exceeds agent authority.",
        details: { fareDifference: "₹2,000", agentAuthority: "₹1,500", status: "Pending supervisor approval" },
      },
      complete: {},
    };
  }

  // 5. Business-class upgrade request (Priya scenario primarily)
  if (has(t, "business", "business class", "first class", "premium", "upgrade my seat", "upgrade me", "free upgrade")) {
    const escalateDemand = has(t, "exception", "escalate", "manager", "supervisor", "insist", "demand", "must", "have to");
    if (escalateDemand) {
      return {
        reply: `${emp}I understand you'd like an exception. The supplied policy does not include a free business-class upgrade, and I don't have the authority to create one. I'm escalating this to a human agent who can review your request.`,
        actions: [
          { time, event: "Business-class upgrade requested", status: "escalation" },
          { time, event: "Request outside stated policy", status: "escalation" },
          { time, event: "Escalation created", status: "escalation" },
        ],
        escalate: {
          type: "human",
          reason: "Customer requested an exception outside stated policy (business-class upgrade).",
        },
        complete: {},
      };
    }
    return {
      reply: `${emp}I understand the appeal of a business-class upgrade. However, the supplied policy does not include a free business-class upgrade — not even for loyalty members. Your Gold status provides priority rebooking, but no additional compensation. If you'd like, I can proceed with your eligible options (refund or free rebooking).`,
      actions: [
        { time, event: "Business-class upgrade requested", status: "info" },
        { time, event: "Request outside stated policy — not approved", status: "info" },
      ],
      escalate: null,
      complete: {},
    };
  }

  // 6. Hotel request
  if (has(t, "hotel", "accommodation", "room", "stay", "lodging")) {
    if (c.id === "priya") {
      return {
        reply: `${emp}Hotel accommodation is provided for delays over 5 hours under the delay policy. Your flight was cancelled, so the hotel benefit doesn't apply. You're entitled to a full refund or free rebooking on the next available flight within 24 hours.`,
        actions: [{ time, event: "Hotel requested — not applicable (cancellation)", status: "info" }],
        escalate: null,
        complete: {},
      };
    }
    if (c.id === "arvind") {
      const pending = pendingBenefits(c, completed);
      const offer = pending.length
        ? ` You are entitled to ${phraseList(pending.map((benefit) => benefitLabel[benefit]))} — would you like me to arrange ${pending.length > 1 ? "those" : "that"}?`
        : "";
      return {
        reply: `${emp}I'm sorry, but hotel accommodation is only provided for delays over 5 hours. Your delay is 4 hours, so I'm unable to arrange a hotel.${offer}`,
        actions: [
          { time, event: "Hotel requested — not eligible (delay under 5h)", status: "info" },
        ],
        escalate: null,
        complete: {},
      };
    }
    // meher — eligible, delayed hours only
    if (completed.hotel) {
      return {
        reply: `${emp}Hotel accommodation has already been arranged for the delayed hours. Is there anything else I can help you with?`,
        actions: [],
        escalate: null,
        complete: {},
      };
    }
    if (has(t, "full night", "overnight", "entire night", "whole night", "full stay")) {
      return {
        reply: `${emp}I can arrange hotel accommodation, but the policy covers only the delayed-hours portion — it does not cover a full night's stay. Would you like me to arrange the eligible delayed-hours accommodation?`,
        actions: [
          { time, event: "Full-night hotel requested — only delayed hours covered", status: "info" },
        ],
        escalate: null,
        complete: {},
      };
    }
    return {
      reply: `${emp}Yes — since your delay is over 5 hours, you're eligible for hotel accommodation covering the delayed hours only. I can arrange that for you. Shall I proceed?`,
      actions: [{ time, event: "Hotel accommodation (delayed hours) confirmed eligible", status: "info" }],
      escalate: null,
      complete: {},
    };
  }

  // 7. Refund request
  if (has(t, "refund", "money back", "get my money", "reimburse")) {
    if (c.disruptionType === "cancellation") {
      const conflict = resolutionConflictReply("refund", completed);
      if (conflict) {
        return {
          reply: `${emp}${conflict}`,
          actions: [{ time, event: "Refund requested — blocked by existing resolution", status: "info" }],
          escalate: null,
          complete: {},
        };
      }
      if (isPendingAction(completed.refund)) {
        return {
          reply: `${emp}Your refund request is still pending. I won't create a duplicate request while it is being processed.`,
          actions: [],
          escalate: null,
          complete: {},
        };
      }
      if (isCompletedAction(completed.refund)) {
        return {
          reply: `${emp}Your refund request has already been initiated. It will be processed to your original payment method within 7 business days. Is there anything else I can help you with?`,
          actions: [],
          escalate: null,
          complete: {},
        };
      }
      return {
        reply: `${emp}I've initiated your full refund request. It will be processed to your original payment method within 7 business days. You don't need to do anything further.`,
        actions: [
          { time, event: "Refund request initiated", status: "done" },
          { time, event: "Refund to original payment method · 7 business days", status: "done" },
        ],
        escalate: null,
        complete: { refund: true },
      };
    }
    const pendingRefund = eligibleBenefits(c).filter((b) => !completed[b]);
    const entTextRefund = pendingRefund.length
      ? phraseList(pendingRefund.map((b) => benefitLabel[b]))
      : "all of your eligible delay benefits have already been arranged";
    const offerRefund = pendingRefund.length
      ? ` Would you like me to arrange ${pendingRefund.length > 1 ? "those" : "that"}?`
      : " Is there anything else I can help you with?";
    return {
      reply: `${emp}Your flight is delayed, not cancelled. Under the policy, a full refund applies to airline-caused cancellations. For your delay, you're entitled to ${entTextRefund}.${offerRefund}`,
      actions: [{ time, event: "Refund requested — not applicable (delay, not cancellation)", status: "info" }],
      escalate: null,
      complete: {},
    };
  }

  // 8. Rebook request
  if (has(t, "rebook", "reschedule", "next flight", "next available", "another flight", "different flight", "change flight")) {
    const conflict = resolutionConflictReply("rebook", completed);
    if (conflict) {
      return {
        reply: `${emp}${conflict}`,
        actions: [{ time, event: "Rebooking requested — blocked by existing resolution", status: "info" }],
        escalate: null,
        complete: {},
      };
    }
    if (isPendingAction(completed.rebook)) {
      return {
        reply: `${emp}Your rebooking is still pending. I won't create a duplicate request while it is being processed.`,
        actions: [],
        escalate: null,
        complete: {},
      };
    }
    if (isCompletedAction(completed.rebook)) {
      return {
        reply: `${emp}Your rebooking has already been secured. Is there anything else I can help you with?`,
        actions: [],
        escalate: null,
        complete: {},
      };
    }
    if (c.disruptionType === "cancellation") {
      return {
        reply: `${emp}I can rebook you on the next available flight within 24 hours at no charge. As a ${c.loyaltyTier} member you have priority access to next-available seats. I don't have specific flight times to share, but I can secure your priority rebooking — shall I proceed?`,
        actions: [
          { time, event: "Free rebooking offered (priority, Gold)", status: "done" },
        ],
        escalate: null,
        complete: { rebook: true },
      };
    }
    return {
      reply: `${emp}I can rebook you on the next available flight within 24 hours at no charge, since this is an airline-caused delay. As a ${c.loyaltyTier} member you have priority rebooking. If you choose a higher-fare flight, the fare difference would apply. Shall I proceed with priority rebooking on the next available flight?`,
      actions: [{ time, event: "Free rebooking offered (priority)", status: "info" }],
      escalate: null,
      complete: { rebook: true },
    };
  }

  // 9. Meal voucher / lounge
  if (has(t, "meal", "food", "hungry", "eat", "voucher")) {
    if (c.disruptionType === "cancellation") {
      const pending = eligibleBenefits(c).filter((b) => !completed[b]);
      const entText = pending.length
        ? phraseList(pending.map((b) => benefitLabel[b]), "or")
        : "your refund and rebooking options have already been processed";
      return {
        reply: `${emp}Meal vouchers are provided under the delay policy. Your flight was cancelled, so that benefit doesn't apply. You're entitled to ${entText} instead.`,
        actions: [{ time, event: "Meal voucher requested — not applicable (cancellation)", status: "info" }],
        escalate: null,
        complete: {},
      };
    }
    if (completed.meal) {
      return {
        reply: `${emp}Your ₹500 meal voucher has already been issued. Is there anything else I can help you with?`,
        actions: [],
        escalate: null,
        complete: {},
      };
    }
    return {
      reply: `${emp}Absolutely. I've issued your ₹500 meal voucher.${buildTail(c, completed, "meal")}`,
      actions: [{ time, event: "Meal voucher issued", status: "done" }],
      escalate: null,
      complete: { meal: true },
    };
  }

  if (has(t, "lounge")) {
    if (c.disruptionType === "cancellation") {
      const pending = eligibleBenefits(c).filter((b) => !completed[b]);
      const entText = pending.length
        ? phraseList(pending.map((b) => benefitLabel[b]), "or")
        : "your refund and rebooking options have already been processed";
      return {
        reply: `${emp}Lounge access is provided under the delay policy. Your flight was cancelled, so that benefit doesn't apply. You're entitled to ${entText}.`,
        actions: [{ time, event: "Lounge access requested — not applicable (cancellation)", status: "info" }],
        escalate: null,
        complete: {},
      };
    }
    if (completed.lounge) {
      return {
        reply: `${emp}Your lounge access has already been arranged. Is there anything else I can help you with?`,
        actions: [],
        escalate: null,
        complete: {},
      };
    }
    return {
      reply: `${emp}Absolutely. I've provided lounge access for the duration of your delay.${buildTail(c, completed, "lounge")}`,
      actions: [{ time, event: "Lounge access provided", status: "done" }],
      escalate: null,
      complete: { lounge: true },
    };
  }

  // 10. Missed meeting / connection (no additional compensation)
  if (has(t, "meeting", "missed", "appointment", "connection", "connecting flight")) {
    const pending = eligibleBenefits(c).filter((b) => !completed[b]);
    const conj = c.disruptionType === "cancellation" ? "or" : "and";
    const eligPhrase = pending.length
      ? phraseList(pending.map((b) => benefitLabel[b]), conj)
      : "all of your eligible benefits have already been arranged";
    const delayPhrase =
      c.disruptionType === "delay"
        ? `Your ${c.delayHours}-hour delay makes you eligible for ${eligPhrase}.`
        : `Your cancellation makes you eligible for ${eligPhrase}.`;
    const offer = pending.length
      ? ` Would you like me to arrange ${pending.length > 1 ? "those" : "that"}?`
      : " Is there anything else I can help you with?";
    return {
      reply: `I understand that you have an important meeting. Unfortunately, the supplied policy does not provide additional compensation based on meetings or other personal commitments. ${delayPhrase}${offer}`,
      actions: [{ time, event: "Missed meeting reported — no additional compensation under policy", status: "info" }],
      escalate: null,
      complete: {},
    };
  }

  // 11. Status inquiry
  if (has(t, "status", "what happened", "what's going on", "update", "why", "reason")) {
    const pending = eligibleBenefits(c).filter((b) => !completed[b]);
    const conj = c.disruptionType === "cancellation" ? "or" : "and";
    const entText = pending.length
      ? phraseList(pending.map((b) => benefitLabel[b]), conj)
      : "all of your eligible benefits have been arranged";
    if (c.disruptionType === "cancellation") {
      return {
        reply: `${emp}Your flight ${c.flight.number} (${c.flight.route}) on ${c.flight.date} was cancelled due to operational reasons. You're entitled to ${entText}. Your return flight on ${c.returnFlight.date} is unaffected.`,
        actions: [{ time, event: "Flight status re-confirmed", status: "done" }],
        escalate: null,
        complete: {},
      };
    }
    return {
      reply: `${emp}Your flight ${c.flight.number} (${c.flight.route}) today is delayed by ${c.delayHours} hours, now departing at ${c.flight.newDeparture}. You're entitled to ${entText}.`,
      actions: [{ time, event: "Flight status re-confirmed", status: "done" }],
      escalate: null,
      complete: {},
    };
  }

  // 12. Greeting
  if (has(t, "hi", "hello", "hey", "good morning", "good afternoon") && t.length < 20) {
    return {
      reply: getInitialGreeting(c),
      actions: [],
      escalate: null,
      complete: {},
    };
  }

  // 13. Compensation beyond policy
  if (has(t, "compensation", "compensate", "extra", "additional compensation", "more than", "cash compensation")) {
    const pending = eligibleBenefits(c).filter((b) => !completed[b]);
    const conj = c.disruptionType === "cancellation" ? "or" : "and";
    const entClause = pending.length
      ? ` (${phraseList(pending.map((b) => benefitLabel[b]), conj)})`
      : " — all of which have already been arranged";
    return {
      reply: `${emp}I understand you're looking for additional compensation. The supplied policy defines the benefits you're entitled to${entClause}. I'm unable to provide compensation beyond the stated policy. If you'd like, I can escalate this to a human agent.`,
      actions: [
        { time, event: "Compensation beyond policy requested", status: "escalation" },
        { time, event: "Escalation created — request beyond policy", status: "escalation" },
      ],
      escalate: {
        type: "human",
        reason: "Customer requested compensation beyond the stated policy.",
      },
      complete: {},
    };
  }

  // 14. Fallback
  const pendingFb = eligibleBenefits(c).filter((b) => !completed[b]);
  const conjFb = c.disruptionType === "cancellation" ? "or" : "and";
  const replyFb = pendingFb.length
    ? `${emp}I want to make sure I help correctly. Based on your booking, you're entitled to ${phraseList(pendingFb.map((b) => benefitLabel[b]), conjFb)}. Could you let me know which of these you'd like, or what specifically I can help with? If I don't have certain information, I'll let you know rather than guess.`
    : `${emp}All of your eligible benefits have already been arranged. Is there anything else I can help you with?`;
  return {
    reply: replyFb,
    actions: [],
    escalate: null,
    complete: {},
  };
}

// ---- quick action handler ----
export function performQuickAction(actionId, c, completed) {
  const time = nowTime();
  const conflict = resolutionConflictReply(actionId, completed);
  if (conflict) {
    return {
      reply: conflict,
      actions: [{ time, event: `${actionId} requested — blocked by existing resolution`, status: "info" }],
      complete: {},
      escalate: null,
    };
  }
  if (isPendingAction(completed[actionId])) {
    return {
      reply: `Your ${benefitLabel[actionId] || actionId} is still pending. I won't create a duplicate action while it is being processed.`,
      actions: [],
      complete: {},
      escalate: null,
    };
  }
  if (isCompletedAction(completed[actionId]) && benefitDonePhrase[actionId]) {
    return {
      reply: `${benefitDonePhrase[actionId]}. Is there anything else I can help you with?`,
      actions: [],
      complete: {},
      escalate: null,
    };
  }
  switch (actionId) {
    case "refund":
      return {
        reply: "I've initiated your full refund request. It will be processed to your original payment method within 7 business days.",
        actions: [
          { time, event: "Refund request initiated", status: "done" },
          { time, event: "Refund to original payment method · 7 business days", status: "done" },
        ],
        complete: { refund: true },
        escalate: null,
      };
    case "rebook":
      return {
        reply: `I've secured your priority rebooking on the next available flight within 24 hours at no charge. As a ${c.loyaltyTier} member you have first access to next-available seats.`,
        actions: [{ time, event: "Free rebooking secured (priority)", status: "done" }],
        complete: { rebook: true },
        escalate: null,
      };
    case "meal":
      return {
        reply: "I've issued your meal voucher. You can use it at participating airport food outlets.",
        actions: [{ time, event: "Meal voucher issued", status: "done" }],
        complete: { meal: true },
        escalate: null,
      };
    case "lounge":
      return {
        reply: "I've provided lounge access for the duration of your delay. Please proceed to the lounge with your boarding pass.",
        actions: [{ time, event: "Lounge access provided", status: "done" }],
        complete: { lounge: true },
        escalate: null,
      };
    case "hotel":
      return {
        reply: "I've arranged hotel accommodation covering the delayed hours only, as per policy. Please note this does not cover a full night's stay.",
        actions: [
          { time, event: "Hotel arranged (delayed hours only)", status: "done" },
        ],
        complete: { hotel: true },
        escalate: null,
      };
    case "supervisor":
      return {
        reply: "I've created a supervisor approval request for the ₹2,000 fare difference, which exceeds my ₹1,500 authority limit. A supervisor will review and follow up.",
        actions: [
          { time, event: "Supervisor approval requested (₹2,000 fare difference)", status: "escalation" },
          { time, event: "Fare difference exceeds agent authority (₹1,500)", status: "escalation" },
        ],
        complete: {},
        escalate: {
          type: "supervisor",
          reason: "Fare difference exceeds agent authority.",
          details: { fareDifference: "₹2,000", agentAuthority: "₹1,500", status: "Pending supervisor approval" },
        },
      };
    default:
      return null;
  }
}

export { quickActionsByCustomer };