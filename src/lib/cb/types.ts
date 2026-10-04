// Shapes of the analytics, admin and audit reads. They mirror the Pydantic
// models in cb-api (`routers/analytics.py`, `admin.py`, `groups.py`); dates are
// ISO strings exactly as the API sends them.

/** Inclusive UTC window, `YYYY-MM-DD` on both ends. */
export type DateRange = { start: string; end: string };

export type DailyRow = {
    day: string;
    messages: number;
    commands: number;
    joins: number;
    leaves: number;
    captcha_issued: number;
    captcha_solved: number;
    active_users: number;
    errors: number;
    p95_latency_ms: number | null;
    llm_tokens: number;
    llm_cost_usd: number;
};

export type CommandRow = {
    command: string;
    invocations: number;
    errors: number;
    p95_latency_ms: number | null;
};

export type ModelCostRow = {
    provider: string;
    model: string;
    calls: number;
    input_tokens: number;
    output_tokens: number;
    cost_usd: number;
    refusals: number;
    errors: number;
};

export type LlmUsage = {
    total_cost_usd: number;
    models: ModelCostRow[];
};

export type Summary = {
    days: number;
    messages: number;
    commands: number;
    joins: number;
    leaves: number;
    errors: number;
    captcha_issued: number;
    captcha_solved: number;
    captcha_solve_rate: number | null;
    peak_active_users: number;
    worst_p95_latency_ms: number | null;
    llm_tokens: number;
    llm_cost_usd: number;
};

export type GroupAnalytics = {
    range: DateRange;
    daily: DailyRow[];
    commands: CommandRow[];
    llm: LlmUsage;
    summary: Summary;
};

export type AdminReach = {
    groups: number;
    groups_left: number;
    members: number;
    admins: number;
};

export type AdminSummary = Summary & { peak_groups: number };

export type AdminBudget = {
    monthly_llm_budget_usd: number | null;
    spent_usd: number;
    remaining_usd: number | null;
};

export type AdminOverview = {
    start: string;
    end: string;
    tenant_id: string;
    display_name: string;
    reach: AdminReach;
    totals: AdminSummary;
    budget: AdminBudget;
};

export type AdminDailyRow = DailyRow & { groups: number };

export type TopGroupRow = {
    group_id: number;
    title: string | null;
    username: string | null;
    messages: number;
    commands: number;
    errors: number;
    peak_active_users: number;
    llm_cost_usd: number;
};

export type AdminCommandRow = CommandRow & { groups: number };

export const AUDIT_ACTIONS = ['config.updated', 'rules.updated', 'welcome.updated', 'session.started'] as const;
export const AUDIT_SURFACES = ['telegram', 'miniapp', 'api', 'system'] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];
export type AuditSurface = (typeof AUDIT_SURFACES)[number];

export type AuditEvent = {
    id: string;
    ts: string;
    action: string;
    surface: string;
    actor_user_id: number | null;
    actor_kind: string;
    summary: string | null;
    before: Record<string, unknown> | null;
    after: Record<string, unknown> | null;
    trace_id: string | null;
};

export type AuditPage = {
    group_id: number;
    events: AuditEvent[];
    next_before: string | null;
};

export type AdminAuditEvent = AuditEvent & {
    group_id: number;
    group_title: string | null;
};

export type AdminAuditPage = {
    events: AdminAuditEvent[];
    next_before: string | null;
};

/** `since` inclusive, `until` exclusive, both ISO-8601 datetimes. */
export type AuditFilters = {
    action?: AuditAction;
    surface?: AuditSurface;
    actor_user_id?: number;
    since?: string;
    until?: string;
    group_id?: number;
};
