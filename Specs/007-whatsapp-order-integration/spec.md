# Feature Specification: WhatsApp Order Integration

**Feature Branch**: `007-whatsapp-order-integration`  
**Created**: January 10, 2026  
**Status**: Draft  
**Input**: User description: "Pull WhatsApp messages associated to an order and store them. Store the latest conversation as a summarized novedad in the order. User can view summary or open full conversation in a different window assuming WhatsApp Web session exists."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View WhatsApp Conversation Summary in Order (Priority: P1)

A technician or employee viewing an order wants to quickly see a summary of recent WhatsApp communication with the customer without leaving the order details screen. The system displays the latest WhatsApp conversation as a "novedad" entry with an AI-generated summary, helping staff understand the current communication status at a glance.

**Why this priority**: This is the core value proposition - giving staff immediate context about customer communication without switching applications. It directly improves response time and customer service quality.

**Independent Test**: Open an order that has WhatsApp messages. Verify that a novedad entry exists with type "WhatsApp Resumen" containing a summarized description of the latest conversation.

**Acceptance Scenarios**:

1. **Given** an order with a linked customer phone number and existing WhatsApp messages, **When** the user views the order details, **Then** a novedad entry shows "WhatsApp Resumen" with an AI-generated summary of the conversation
2. **Given** an order where new WhatsApp messages arrived since last summary, **When** the user refreshes or views the order, **Then** the system generates an updated summary novedad
3. **Given** an order with no WhatsApp messages for the customer, **When** the user views the order details, **Then** no WhatsApp-related novedad appears

---

### User Story 2 - Sync WhatsApp Messages for an Order (Priority: P2)

An employee wants to pull and store WhatsApp messages for a specific order's customer. The system fetches messages from WhatsApp Business API based on the customer's phone number and stores them locally, linking them to the order for future reference.

**Why this priority**: Message storage is the foundation for all other features. Without stored messages, summaries and conversation viewing are not possible.

**Independent Test**: Select an order with a customer that has a phone number. Trigger "Sync WhatsApp" action. Verify messages are fetched and stored in the database linked to the order.

**Acceptance Scenarios**:

1. **Given** an order with a customer phone number, **When** the user triggers "Sync WhatsApp Messages", **Then** the system fetches messages from WhatsApp Business API and stores them locally
2. **Given** the system has already synced messages for an order, **When** sync is triggered again, **Then** only new messages since the last sync are fetched
3. **Given** a customer phone number that has no WhatsApp messages, **When** sync is triggered, **Then** the system displays "No messages found" and records the sync attempt
4. **Given** the WhatsApp API is unavailable, **When** sync is triggered, **Then** the system displays an appropriate error and allows retry

---

### User Story 3 - Open Full WhatsApp Conversation (Priority: P3)

An employee wants to view the complete WhatsApp conversation history with a customer or continue the conversation. The system opens WhatsApp Web in a new browser window/tab, navigating directly to the conversation with the customer's phone number.

**Why this priority**: This extends the read-only view to allow full interaction but requires WhatsApp Web session to already exist on the user's browser.

**Independent Test**: Click "Open WhatsApp Conversation" button on an order. Verify a new window opens with WhatsApp Web pointing to the correct phone number conversation.

**Acceptance Scenarios**:

1. **Given** an order with a valid customer phone number, **When** user clicks "Open WhatsApp Conversation", **Then** WhatsApp Web opens in a new browser tab/window with the customer's chat
2. **Given** the user does not have an active WhatsApp Web session, **When** they click "Open WhatsApp Conversation", **Then** WhatsApp Web prompts them to scan QR code (standard WhatsApp behavior)
3. **Given** an order where customer has no phone number, **When** the system renders order details, **Then** the "Open WhatsApp Conversation" button is disabled with tooltip "No phone number available"

---

### User Story 4 - Browse Stored Message History (Priority: P4)

An employee wants to view all stored WhatsApp messages for a customer within the FastService application, without needing WhatsApp Web access. This allows reviewing historical conversations even if the original messages were deleted from WhatsApp.

**Why this priority**: This is a convenience feature that provides value for audit and review purposes but requires more UI investment.

**Independent Test**: Open an order's WhatsApp history panel. Verify all stored messages display chronologically with sender, timestamp, and content.

**Acceptance Scenarios**:

1. **Given** an order with stored WhatsApp messages, **When** user opens the message history panel, **Then** messages display chronologically with sender identification, timestamp, and content
2. **Given** stored messages include media (images/documents), **When** viewing message history, **Then** media types are indicated with placeholder text (actual media not stored)
3. **Given** no stored messages for an order, **When** user opens the message history panel, **Then** system displays "No messages stored. Click 'Sync WhatsApp' to fetch messages."

---

### Edge Cases

- What happens when customer has multiple phone numbers (Telefono1, Telefono2)? System uses Telefono1 as primary; if empty, uses Telefono2
- How does the system handle international phone number formats? Phone numbers are normalized to E.164 format before API calls
- What happens if WhatsApp rate limits are exceeded? System queues requests and displays "Please try again in X minutes"
- How long are messages retained? Messages are retained indefinitely until manually purged by administrator
- What if the customer opts out of WhatsApp business messages? System respects opt-out status from API and marks customer accordingly

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST store WhatsApp messages linked to orders via customer phone number
- **FR-002**: System MUST generate AI-summarized novedades from WhatsApp conversations
- **FR-003**: System MUST support fetching messages on-demand per order
- **FR-004**: System MUST normalize phone numbers to E.164 format (e.g., +5491155551234)
- **FR-005**: System MUST track last sync timestamp per customer to enable incremental sync
- **FR-006**: System MUST open WhatsApp Web conversation via deep link (wa.me/{phone})
- **FR-007**: System MUST create novedad entries with type "WhatsApp Resumen" for conversation summaries
- **FR-008**: System MUST display message direction (inbound from customer vs outbound from business)
- **FR-009**: System MUST handle API authentication using WhatsApp Business credentials
- **FR-010**: System MUST provide visual indicator when new messages are available since last summary

### Key Entities

- **WhatsAppMessage**: Individual message record (messageId, orderId, customerPhone, direction, content, timestamp, messageType, whatsAppTimestamp)
- **WhatsAppSyncLog**: Tracks sync operations per customer (customerId, lastSyncTimestamp, status, messageCount)
- **Novedad (extended)**: Existing entity used to store AI summaries with TipoNovedad = "WhatsApp Resumen"
- **TipoNovedad (new entry)**: New type entry for "WhatsApp Resumen" to categorize conversation summaries

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Staff can view WhatsApp conversation context within 2 seconds of opening an order
- **SC-002**: Message sync completes within 10 seconds for conversations with up to 100 messages
- **SC-003**: AI summaries accurately capture the key topics and action items from conversations
- **SC-004**: 95% of staff report improved customer context awareness in service interactions
- **SC-005**: Time to understand customer communication history reduced by 70% compared to switching to WhatsApp manually
- **SC-006**: System successfully syncs messages for orders where customer phone number is valid

## Assumptions

- WhatsApp Business API access is available and configured for the business phone number
- Customers' phone numbers in the system match their WhatsApp accounts
- Users have WhatsApp Web access on their browsers for the "open conversation" feature
- Azure OpenAI is available for generating conversation summaries (already configured per spec 001)
- The existing Novedad/TipoNovedad system can accommodate the new "WhatsApp Resumen" type
- Message storage is limited to text content; media files are noted but not stored
