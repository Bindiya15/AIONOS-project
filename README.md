# AIONOS Customer Resolution Agent

An AI-powered customer resolution agent designed to handle airline disruption scenarios such as flight delays, cancellations, refunds, rebooking, compensation, and customer assistance.

The system combines conversational AI with **state-aware action handling** so that the agent can track previously performed actions and avoid incorrectly repeating benefits or conflicting resolutions.

---

## 🚀 Overview

The **AIONOS Customer Resolution Agent** helps customers resolve flight-related issues through a conversational interface.

Instead of simply responding to each message independently, the agent maintains awareness of the customer's situation and previously performed actions.

For example:

* If a meal voucher has already been issued, the agent should not issue it again.
* If lounge access has already been granted, it should not be offered again unnecessarily.
* If a refund has already been initiated, the agent should not immediately initiate a conflicting rebooking.
* If an action failed, the customer should be allowed to retry it.
* If an action is pending, the agent should avoid creating a duplicate request.

This makes the conversation more consistent and closer to a real customer-support workflow.

---

## ✨ Key Features

### 💬 Conversational Customer Support

The agent understands customer requests related to:

* Flight delays
* Flight cancellations
* Refunds
* Rebooking
* Hotel accommodation
* Meal vouchers
* Lounge access
* Compensation
* Escalation to support

### 🧠 State-Aware Action Handling

The agent maintains action state throughout the conversation.

Supported states include:

* Available
* Completed
* Failed
* Pending
* Not eligible

The system checks the current state before performing or recommending an action.

### 🔄 Duplicate Action Prevention

Previously completed benefits are not unnecessarily offered or issued again.

For example:

```text
Customer: I need a meal voucher.

Agent: Your ₹500 meal voucher has been issued.

Customer: Can I get a meal voucher?

Agent: Your meal voucher has already been issued.
```

### ⚠️ Conflict-Aware Resolution

The system also handles mutually conflicting actions.

For example:

```text
Customer: I want a refund.

Agent: I've initiated your full refund request.

Customer: I've changed my mind. I want rebooking.
```

The agent recognizes that a refund has already been initiated instead of blindly starting a rebooking action.

### 🔁 Failed Action Retry

A failed action is different from a completed action.

If an action fails, the customer can retry it rather than being incorrectly told that the benefit has already been provided.

---

## 🏗️ System Architecture

```text
Customer
   │
   ▼
Conversation Interface
   │
   ▼
Agent Engine
   │
   ├── Customer Data
   │
   ├── Policy / Eligibility Logic
   │
   ├── Conversation State
   │
   └── Action History
           │
           ▼
      Action Handling
           │
      ┌────┼────┐
      ▼    ▼    ▼
   Success Failed Pending
      │
      ▼
Updated Conversation State
```

---

## 🧩 Core Components

### Agent Engine

Responsible for interpreting customer requests and generating appropriate responses.

### Customer Data

Contains customer-specific information such as:

* Customer profile
* Membership status
* Flight information
* Disruption details
* Eligibility information

### Action State

Tracks actions performed during the conversation.

Example:

```javascript
{
  meal: "completed",
  lounge: "completed",
  refund: "pending",
  rebook: false
}
```

### Action Validation

Before performing an action, the system checks its current state.

Conceptually:

```text
Completed → Do not duplicate
Pending   → Do not duplicate
Failed    → Allow retry
Available → Allow action
```

---

## 🛫 Example Customer Scenario

### Flight Delay

A customer is informed that their flight has been delayed by four hours.

Based on the applicable policy, they are eligible for:

* ₹500 meal voucher
* Lounge access

Hotel accommodation is not available because the delay does not meet the required threshold.

If the customer subsequently requests a hotel, the agent checks the existing action state and responds without unnecessarily repeating benefits that have already been provided.

---

## 🔐 State Management Principles

The project follows several important principles for reliable agent behaviour:

### 1. Never treat every message as a new conversation

Previous actions must influence future responses.

### 2. Completed ≠ Failed

A failed action should remain retryable.

### 3. Pending ≠ Completed

A pending action should not be duplicated, but it should not be represented as successfully completed either.

### 4. Conflicting actions require validation

Actions such as refund and rebooking should be checked against the current state before proceeding.

### 5. The agent should not claim an action was performed unless the action actually succeeded

This prevents misleading customer responses.

---

## 🛠️ Tech Stack

* **React**
* **Vite**
* **JavaScript**
* **HTML**
* **CSS**
* **Git & GitHub**
* **GitHub Codespaces**

---

## 📁 Project Structure

```text
AIONOS-project/
│
├── src/
│   ├── components/
│   │   ├── ActionRecord.jsx
│   │   ├── ChatPanel.jsx
│   │   ├── CustomerPanel.jsx
│   │   ├── EscalationCard.jsx
│   │   ├── Header.jsx
│   │   ├── QuickActions.jsx
│   │   └── ResolutionPanel.jsx
│   │
│   ├── lib/
│   │   ├── agentData.js
│   │   └── agentEngine.js
│   │
│   └── ...
│
├── package.json
├── vite.config.js
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have:

* Node.js
* npm
* Git

### Installation

Clone the repository:

```bash
git clone <repository-url>
```

Navigate into the project:

```bash
cd AIONOS-project
```

Install dependencies:

```bash
npm install
```

### Run the Development Server

```bash
npm run dev
```

The application will start on the local development server.

---

## 🧪 State Handling Tests

The project includes checks for important conversation-state scenarios, including:

* Preventing duplicate completed benefits
* Allowing actions that are still available
* Handling failed actions as retryable
* Preventing conflicting refund/rebooking actions
* Distinguishing pending actions from completed actions

Example validation:

```text
Completed action → blocked
Failed action    → retry allowed
Pending action   → duplicate prevented
Available action → allowed
```

---

## 🎯 Project Goals

The primary goal of the project is to demonstrate how an agentic customer-support system can move beyond simple question-answering and maintain **context, action history, eligibility, and resolution state** throughout a conversation.

The project focuses particularly on:

* Context-aware conversations
* Reliable action execution
* State management
* Policy-based decisions
* Duplicate prevention
* Conflict handling
* Customer resolution workflows

---

