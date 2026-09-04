# Trygc Command Center

You are rebuilding the reference application:

https://next-shadcn-admin-dashboard.vercel.app/dashboard/default

Do NOT create another generic admin dashboard.

Inspect the reference application carefully and reuse its strongest UI/UX concepts, component structure and interaction patterns, then transform it into a production-quality Trygc (Grand Community) CRM & Business Operations OS.

The final product should feel like a premium combination of:

CRM + Campaign Operations + Community Management + Finance/ERP + PMO/Tasks + Approvals + Reporting + Corporate Administration

It must become the central operating environment for Trygc across Egypt and GCC.

PRODUCT OBJECTIVE

Build one centralized source of truth for:

Sales

Business Development

Account Management

Client Success

Community

Campaign Management

Influencer Management

Operations

Coordination

WhatsApp Operations

Posting Coverage

Quality / QA

Finance

Management

IT / Administration

Tasks / PMO

Corporate files

Access governance

Do NOT build disconnected dashboards.

Clients, deals, campaigns, influencers, tasks, invoices, payments, approvals, files and activities must be relationally connected throughout the UI.

Example:

Client → Deal → Campaign → Influencers → Activities → Costs → Invoice → Collection → Reporting

DESIGN DIRECTION

Preserve the sophistication and usability of Studio Admin but completely replace its generic identity.

Trygc Branding

Use:

Primary Purple: #7B3FF2

Accent Orange: #FF7A18

Supporting purple/pink gradients only where useful

Light mode as the default

Premium dark mode available

Clean neutral backgrounds

Modern SaaS aesthetic

Soft shadows

subtle borders

strong typography hierarchy

generous spacing

Fonts:

Outfit for headings

Inter for body/data-heavy screens

Do NOT create an overly purple interface.

Use purple/orange strategically for:

primary actions

navigation states

status highlights

charts

important insights

Tables and dashboards should remain professional and highly readable.

LAYOUT

Keep the reference application's strongest shell patterns:

Global Sidebar

Collapsible, organized by domain.

Top Navigation

Include:

Branch/entity selector

Global search

Command palette

Quick Create

Notifications

Approvals

Current user

Language

Theme switcher

Global Filters

Where relevant:

Country / Entity Branch Client Campaign Owner Department Date range Status Currency

Management users must be able to switch between:

Group View / Country View / Branch View / Individual View

MAIN NAVIGATION

Organize the sidebar approximately as:

COMMAND CENTER

Executive Overview

My Workspace

Alerts & Exceptions

Approvals

Activity Feed

CRM

CRM Dashboard

Leads

Companies / Clients

Contacts

Deals

Activities

Meetings

Proposals

Accounts

Pipeline

Client 360

CAMPAIGNS

Campaign Command Center

All Campaigns

Campaign Pipeline

Influencers

Approvals

Visits / Sessions

Posting Coverage

Missing Coverage

Replacements

QA

Campaign Reports

COMMUNITY

Community Dashboard

Campaign Ownership

Influencer Planning

Influencer Relations

Client Requirements

Client Meetings

Influencer Discovery

OPERATIONS

Operations Dashboard

Queue

Onboarding

Coordination

WhatsApp

Visits

Posting Coverage

Exceptions

QA Handoff

FINANCE

Finance Command Center

Entities

Chart of Accounts

General Ledger

Transactions

Accounts Receivable

Accounts Payable

Invoices

Expenses

Payments

Banking / Cash

Budgets

Exchange Rates

Financial Statements

Consolidation

Period Closing

TASKS & PMO

My Tasks

Team Tasks

Kanban

Calendar

Workload

SLA Monitor

Automation Rules

REPORTING

Executive Reports

CRM Reports

Campaign Reports

Operations Reports

Finance Reports

Custom Report Builder

FILES

Corporate Files

Clients

Campaign Files

Finance Documents

Shared Folders

ADMIN

Users

Teams

Roles

Permissions

Branches

Entities

Integrations

Import / Migration

SaaS Access

Audit Log

System Settings

EXECUTIVE COMMAND CENTER

Replace generic dashboard cards with real Trygc management intelligence.

Show:

Active Clients

Sales Pipeline Value

Won Revenue

Open Deals

Stuck Deals

Active Campaigns

Campaigns At Risk

Influencers Required

Influencers Confirmed

Missing Posting Coverage

Missed Visits

Overdue Tasks

Outstanding Receivables

Payables

Cash Position

Group Revenue

Group Expenses

Group Profit

Branch performance

Provide:

Group Map / Entity Comparison

Saudi Arabia UAE Kuwait Egypt Qatar Bahrain

Show financial and operational health for each.

Management Exceptions

Surface actionable problems rather than decorative charts:

campaign behind target

client approval pending

confirmation shortage

missing posting coverage

missed visit

overdue invoice

overdue client payment

overdue task

stuck deal

finance approval pending

FX rate missing

COA request pending

Every alert must show:

Issue → Owner → Age → Impact → Required Action → Deadline

CRM

Create a proper B2B CRM.

Lead Management

Fields:

Lead

Company

Country

Industry

Source

Contact

Owner

Potential value

Currency

Status

Last activity

Next activity

Next action

Age

Priority

Sales Pipeline:

New Lead → Contacted → Qualified → Discovery → Proposal → Negotiation → Won / Lost

Support:

drag-and-drop pipeline

table view

filters

activity timeline

follow-up reminders

meetings

calls

emails

notes

attachments

proposal tracking

probability

expected close date

loss reason

competitor

revenue forecast

Stuck Deal Detection

Automatically identify deals with no activity or stage movement.

Create weekly stuck-deal alerts.

CLIENT 360

Every client must have a complete profile.

Tabs:

Overview Contacts Deals Campaigns Activities Meetings Tasks Invoices Payments Financial Summary Documents Issues Timeline

Show:

Account Manager

escalation owner

lifetime revenue

outstanding balance

active campaigns

previous campaigns

campaign health

client satisfaction/risk

last interaction

next action

Only one Account Manager should be the primary owner at a time.

CAMPAIGN OPERATIONS ENGINE

This is one of the most important modules.

Each campaign must contain:

Client Country City Branch Campaign owner Operations owner Backup owner Target Required influencers Campaign dates Posting requirements Brief Budget Client approvals Campaign health SLA Next action

Influencer Workflow

Implement:

Target → Prospected → Contacted → Interested → Confirmation Requested → Confirmed → Submitted to Client → Approved / Rejected → Replacement Required → Scheduled → Visited → Posting Coverage Received → Posting Coverage Verified → Completed

Additional states:

No Response

Follow-up Required

Brief Sent

Paid Ads Response

Rejection + reason

Cancelled

Influencer Cancelled

Client Cancelled

Missed Visit

Rescheduled

Missing Posting Coverage

Posting Coverage Rejected

Blacklisted

Store timestamps for every stage movement.

Never use only the word "posting" when operationally referring to creator delivery.

Use Posting Coverage.

CAMPAIGN HEALTH

Automatically calculate:

Green Amber Red Critical

Based on:

target vs confirmed

target vs client-approved

upcoming visit dates

replacements required

missing posting coverage

overdue approvals

cancellations

missed visits

campaign deadline

operational SLA

Every unhealthy campaign should show:

Root Cause Impact Owner Action Plan ETA Escalation

COMMUNITY WORKSPACE

Community owns client/campaign health while Operations owns execution.

Community functionality:

campaign creation

client requirements

influencer criteria

influencer planning

client approvals

client meeting tracking

client communication

influencer discovery

influencer relationship management

remaining target monitoring

Track required client meetings.

Allow campaign owners to clearly see:

Target Identified Interested Confirmed Submitted Approved Remaining

OPERATIONS WORKSPACE

Create operational queues instead of simple task lists.

Queues:

Onboarding Coordination WhatsApp Visits Posting Coverage QA

Each queue item contains:

Priority Country Client Campaign Influencer Owner Created at Age SLA Deadline Status Next action

Queue managers must be able to:

assign

reassign

bulk assign

balance workload

sort by SLA

identify ageing

identify blocked items

escalate issues

monitor team capacity

TASK & PMO ENGINE

Keep and upgrade the reference Tasks + Kanban functionality.

Views:

Table Kanban Calendar My Tasks Team Tasks Timeline

Task fields:

Task ID Task Description Department Owner Backup Country Client Campaign Priority Status Start date Due date ETA % Complete SLA RAG Dependencies Deliverable Comments Attachments

Statuses:

Backlog To Do In Progress Blocked Pending Approval Done Cancelled Postponed

Support automation.

Example:

Create recurring daily operational tasks automatically every morning.

Send reminders before/after ETA.

Create overdue alerts.

Create manager escalation.

Generate daily employee/team performance summaries.

FINANCE — MULTI-ENTITY ARCHITECTURE

This is a HIGH-PRIORITY requirement.

Create a unified Group Finance environment supporting:

Current / Future Entities

Saudi Arabia — SAR UAE — AED Kuwait — KWD Egypt — EGP Qatar — QAR Bahrain — BHD Future entities

Each entity operates independently within authorized scope.

Group Finance can view consolidated information.

The Group reporting currency is:

SAR

MULTI-CURRENCY ACCOUNTING

Each branch/entity records transactions in its local currency.

System must maintain:

Transaction currency

Local currency

Group reporting currency

FX rate

FX rate date

FX source

converted SAR value

Support:

historical FX rates

effective dates

locked rates

approved manual adjustments

realized FX differences

unrealized FX differences

Never silently convert currencies.

Clearly display currency everywhere.

Examples:

SAR 250,000 AED 120,000 EGP 3,500,000 KWD 18,500

GROUP CONSOLIDATION

Management must be able to view:

Local

Entity reports in their operating currency.

Consolidated

Group reports in SAR.

Provide:

Group Income Statement

Group Balance Sheet

Cash Flow

Trial Balance

Revenue by entity

Expenses by entity

Profit by entity

Consolidated AR

Consolidated AP

Avoid Excel-based manual consolidation.

Design architecture to support intercompany adjustments and eliminations.

UNIFIED CHART OF ACCOUNTS

Implement one controlled Group Chart of Accounts.

Fields:

Account Code Account Name Account Type Parent Account Group Category Entity Applicability Currency behaviour Active / Inactive Created by Approved by Effective date

Branch accountants:

CAN use authorized accounts.

CANNOT independently create or modify the COA.

New account workflow:

Account Request → Finance Manager Review → Approved / Rejected → Account Creation → Entity Assignment → Audit Record

Only authorized Finance/Admin roles may alter the master COA.

FINANCE OPERATIONS

Build functional modules for:

General Ledger

Journal Entries

Accounts Receivable

Accounts Payable

Customer Invoices

Vendor Bills

Expenses

Collections

Payments

Bank/Cash accounts

Budget tracking

Financial statements

Invoices should preserve the strong invoice creation/preview concept from the reference system but adapt it to Trygc.

Support:

Draft Pending Approval Issued Partially Paid Paid Overdue Cancelled

Link invoices directly to:

Client Deal Campaign Branch Entity

FINANCIAL PERIOD GOVERNANCE

Add:

Accounting periods

Month close status

period lock

reopen permissions

adjustment journals

close checklist

pending items

audit history

Branch users should not modify locked periods without authorization.

FUTURE BRANCH ONBOARDING

Build an "Add Entity" wizard.

Required:

Legal entity Country Currency Fiscal year Tax configuration COA assignment Opening balances Users Roles Approval hierarchy Bank accounts Reporting structure

Adding Qatar, Bahrain or future branches should not require redesigning the application.

CRM + FINANCE CONNECTION

Do NOT separate Finance completely from CRM.

Example flow:

Lead → Deal → Won → Client → Campaign → Budget → Client Invoice → Payment Collection → Revenue Recognition / Reporting

Management should be able to start from a client and see:

Pipeline value Won deals Campaign value Invoices Received Outstanding Expenses Margin

APPROVAL CENTER

Create a centralized Approval Inbox.

Examples:

COA creation

finance adjustment

invoice approval

payment approval

expense approval

proposal approval

campaign change

influencer approval

access request

Show:

Requester Entity Request type Value/impact Submitted date Age Approver Status

Support:

Approve Reject Return for changes Comment Delegate

Every approval must be logged.

USERS / ROLES / PERMISSIONS

Upgrade the reference Roles & Permissions module.

Example roles:

Group Admin Executive Management Finance & Administration Manager Group Finance Branch Accountant Sales Manager Sales Account Manager Community Manager Community Specialist Operations Manager Queue Manager Operations Specialist Quality IT Admin Viewer

Permissions must work at:

Module level Action level Country level Entity level Branch level

Examples:

Egypt Accountant:

Egypt finance only.

KSA Community:

KSA campaign/community records.

Group Finance:

all financial entities.

Executive:

group consolidated reporting.

Branch accountants must NOT edit the master COA.

Implement permission sets, access reviews and audit logging.

FILE MANAGEMENT / pCLOUD

Preserve the reference File Manager experience.

Create a corporate file structure for:

Saudi Arabia Egypt UAE Kuwait Qatar Bahrain Future branches

Support folders for:

Clients Campaigns Finance Contracts Invoices Reports Corporate documents

Permissions must respect role and branch access.

Files should be linkable to CRM objects.

Example:

Campaign → Brief → Contract → Coverage → Client Report

Prepare an integration adapter for pCloud.

If real API credentials are unavailable, create the complete integration architecture and mocked provider rather than breaking the build.

ZOHO / DATA MIGRATION CENTER

Create an admin migration workspace for legacy systems.

Support:

Zoho

Excel

CSV

existing CRM exports

Features:

Upload Preview Column mapping Validation Duplicate detection Import dry run Import errors Successful rows Rejected rows Rollback metadata Import history

Special attention should be given to legacy Zoho Egypt / Excel-based records.

Do NOT blindly create duplicates.

INTEGRATION CENTER

Create integration cards for:

CRM Support Zoho pCloud Email Calendar WhatsApp/Webhooks Future APIs

Statuses:

Connected Not Connected Needs Configuration Error Pending Support Disabled

Show:

Owner Last sync Last error Webhook status Authentication status

Do not hardcode integrations directly into page components.

Create provider/service adapters.

CORPORATE CHATGPT / SAAS ACCESS

Create an Admin → SaaS Access workspace.

Purpose:

Avoid business tools being controlled by individual employee accounts.

Track:

Application Employee Corporate email Department Role Branch License/seat Status Assigned date Last review

Include ChatGPT as one managed service.

Support:

Invite Assign Suspend Revoke Transfer ownership Offboarding checklist

Do not hardcode current ChatGPT commercial plans or pricing into the application.

This module is primarily corporate access governance.

CORPORATE FILE + ACCESS GOVERNANCE

When an employee changes role or leaves:

Display all linked access:

CRM pCloud ChatGPT Finance Integrations Other systems

Allow administrators to run an offboarding checklist.

Audit every change.

NOTIFICATIONS

Build a real Notification Center.

Categories:

CRM Campaign Client Finance Task Approval System

Examples:

Deal inactive for 7 days Campaign confirmation shortage Client approval overdue Visit tomorrow Missing posting coverage Invoice overdue Payment received Task breached SLA COA request awaiting review Integration failed

Provide:

Unread/read Priority Owner Linked record Timestamp Action button

GLOBAL SEARCH & COMMAND PALETTE

Keep the reference command palette concept and make it powerful.

Search:

Clients Contacts Deals Campaigns Influencers Tasks Invoices Payments Users Files

Commands:

Create Client Create Deal Create Campaign Create Task Create Invoice Add Payment Upload File Invite User

Keyboard accessible.

ANALYTICS

Do NOT create meaningless decorative charts.

Every visualization must answer a management question.

CRM examples:

Pipeline by stage Conversion Sales velocity Stuck deals Won/lost Revenue forecast

Campaign:

Targets vs Confirmed vs Approved Missing posting coverage Missed visits Campaign risk Country performance

Operations:

Queue size Overdue SLA Workload Employee performance

Finance:

Revenue Expenses Profit Cash AR ageing AP ageing Entity comparison Currency exposure

Charts must support tooltips, filters and drilldown.

TABLE STANDARD

Tables are a major part of this application.

Use TanStack-style advanced tables with:

Search Filters Multi-filter Sorting Pagination Column visibility Column resizing Sticky headers Row selection Bulk actions Export Saved views

Tables must use the full available width.

Avoid narrow centered tables.

The user should be able to customize which columns are visible.

RECORD DETAIL UX

Avoid sending users through excessive pages.

Use combinations of:

Detail pages Side sheets Drawers Modals Tabs

Example Client detail:

Summary | Activity | Deals | Campaigns | Finance | Tasks | Files

Example Campaign detail:

Overview | Influencers | Approvals | Visits | Posting Coverage | Tasks | Finance | Files | Timeline

ACTIVITY TIMELINE

Major records should have immutable activity history.

Example:

09:10 Campaign created 09:26 Influencer invited 11:45 Influencer confirmed 13:15 Submitted to client 15:42 Client approved Next day 10:00 Visit scheduled

Include:

Actor Timestamp Change Previous value New value

AUDIT LOG

Central audit log containing:

User Action Module Record Entity Timestamp Old value New value IP/session metadata when available

Important financial and permission activities must never silently disappear.

AUTOMATION ENGINE

Create rule-driven automations.

Structure:

WHEN condition

IF optional criteria

THEN action

Examples:

WHEN deal has no activity for 7 days → notify Account Manager.

WHEN influencer misses visit → create replacement task + alert Operations.

WHEN posting coverage is overdue → create follow-up task.

WHEN invoice passes due date → mark overdue + notify Finance.

WHEN task breaches SLA → escalate to manager.

WHEN new employee is created → start onboarding checklist.

Allow enable/disable, execution history and failure logs.

REPORT BUILDER

Users should be able to build reports by selecting:

Entity Country Client Campaign Owner Department Date Status Currency

Choose:

Metrics Dimensions Filters Table Chart

Allow:

Save Report Duplicate Export Share

Management should have predefined executive reports.

BILINGUAL

Application must support:

English — LTR Arabic — RTL

Changing language must correctly mirror:

Sidebar Navigation Forms Tables Drawers Modals

Do not simply translate text without changing direction.

QUICK CREATE

Keep the reference Quick Create feature.

It should allow creation of:

Lead Client Contact Deal Campaign Influencer Task Invoice Payment Expense Folder

without leaving the current page.

RESPONSIVENESS

Desktop-first because this is a business operations application.

Optimize especially for:

1366×768 1440×900 1920×1080

Support tablets and mobile for essential functions.

On desktop make dashboards, tables and charts WIDE.

Avoid excessive empty margins and tiny center columns.

DEVELOPMENT REQUIREMENTS

Use the existing Studio Admin architecture wherever it is strong.

Preferred stack:

Next.js App Router

TypeScript strict mode

Tailwind CSS

shadcn/ui

TanStack Table

React Hook Form

Zod

lightweight client state such as Zustand where needed

accessible charting library

dnd-kit for drag/drop when required

Do not install unnecessary libraries when the existing stack already solves the requirement.

Organize code by feature/module.

Examples:

features/crm features/campaigns features/community features/operations features/finance features/tasks features/reports features/files features/admin

Shared components belong separately.

BACKEND / DATA APPROACH

The first version MUST run locally without requiring external paid infrastructure.

Provide realistic seeded Trygc demo data.

Do not tightly couple the UI to a specific database.

Create clean repository/service/provider abstractions so a real API/database can replace mock data later.

Use strong TypeScript models.

Do NOT put giant hardcoded data arrays inside UI components.

REALISTIC DEMO DATA

Do not use:

John Doe Acme Inc. $999 fake SaaS examples

Use realistic Trygc-style examples.

Countries:

Saudi Arabia Egypt UAE Kuwait Qatar Bahrain

Currencies:

SAR EGP AED KWD QAR BHD

Use clients, campaigns, creators, amounts, tasks and statuses that make sense for an influencer-marketing company.

Do not fabricate actual confidential company information.

UI QUALITY RULES

Do NOT:

turn everything into cards

make every section a different gradient

create meaningless charts

overuse animations

build one giant page

hide important data behind excessive clicks

create tiny tables

use horizontal scrolling unnecessarily

mix unrelated modules

create fake buttons

leave dead navigation items

leave lorem ipsum

ship unfinished placeholder pages

Every visible button must either work or intentionally show a clearly designed pending integration state.

CODE QUALITY

Require:

Type safety Reusable components Error boundaries Loading states Empty states Error states Skeleton loaders Form validation Accessible components Responsive design Clean routing Modular architecture No console errors No broken routes

Run:

lint typecheck build

before completing the work.

Fix all critical errors.

IMPLEMENTATION PRIORITY

Do not attempt 100 weak screens.

Build high-quality foundations first.

PHASE 1

Application shell

Trygc design system

Authentication mock

RBAC architecture

Group/branch context

Executive dashboard

CRM

Client 360

Campaign engine

Campaign detail

Operations queues

Tasks

Finance entities

Unified COA

Multi-currency architecture

Invoices

Consolidated Finance dashboard

Users/Roles

Audit log

File manager

PHASE 2

Add:

Advanced accounting Automation builder Integration center Data migration Advanced reports pCloud adapter SaaS governance Arabic Enhanced analytics

But architecture must accommodate these from the start.

ACCEPTANCE TEST

Before declaring completion, verify that I can:

Change from Group to Saudi Arabia and see scoped data.

Open Egypt and view amounts in EGP.

Return to Group and view consolidation in SAR.

Open the master Chart of Accounts.

Confirm a branch accountant cannot modify it.

Create a CRM lead.

Move a deal through the pipeline.

Detect an inactive/stuck deal.

Convert a won deal into a client/campaign.

Open a client 360 profile.

Create a campaign.

Add influencers.

Move influencers through confirmation/client approval/visit/posting coverage.

Identify missing posting coverage.

See campaign health change.

Create/reassign Operations work.

Create and move tasks on Kanban.

Create an invoice linked to a client/campaign.

Track invoice payment status.

View branch finance.

View Group consolidated finance in SAR.

Submit a new COA account request.

Approve it with the authorized Finance role.

Search globally for a client/campaign/invoice.

Open files associated with a campaign.

Review an audit trail.

Manage users and branch permissions.

Use Quick Create.

Use the command palette.

Switch between light and dark mode.

If these workflows are not functional, the implementation is incomplete.

FINAL PRODUCT STANDARD

This must NOT feel like:

"Studio Admin with Trygc colors."

It should feel like Studio Admin evolved into a purpose-built Trygc enterprise operating platform.

Preserve the reference application's premium visual quality while making the workflows substantially more intelligent and relevant to Trygc.

The most important product principle is:

The system must always make it obvious what is happening, what is wrong, who owns it, what is overdue, and what should happen next.

Prioritize:

Operational clarity Financial governance Cross-branch visibility Automation Management intelligence Auditability Speed of use

Build real workflows, not decorative screens.

Start by inspecting the existing codebase/reference application, create a concise implementation map, and then immediately implement the application. Do not stop after producing a plan or mockup.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/dc59c4f3-706a-4f8d-99e1-7a5e688b37af).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
