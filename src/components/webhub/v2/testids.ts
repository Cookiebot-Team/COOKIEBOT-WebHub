// Stable `data-testid` values for QA (Playwright `getByTestId`). Values are
// a contract with Cookiebot-QA: rename only together with docs/testids.md.
// Format: kebab-case `<area>-<element>[-<key>]`; keys are API values.

export const TID = {
    savebar: {
        floating: 'savebar-floating',
        docked: 'savebar-docked',
        message: 'savebar-message',
        discard: 'savebar-discard',
        save: 'savebar-save',
    },
    /** Switch for a group config key, e.g. `setting-sfw`. */
    setting: (key: string) => `setting-${key}`,
    slider: (key: string) => `slider-${key}`,
    sliderValue: (key: string) => `slider-${key}-value`,
    textarea: (key: string) => `textarea-${key}`,
    textareaCount: (key: string) => `textarea-${key}-count`,
    errorBanner: 'error-banner',
    // Shell: content area, navigation, headers.
    screen: (section: string) => `screen-${section}`,
    nav: (section: string) => `nav-${section}`,
    tile: (section: string) => `tile-${section}`,
    community: (key: string) => `community-${key}`,
    sidebar: 'sidebar',
    sidebarGroup: 'sidebar-group',
    headerMobile: 'header-mobile',
    headerDesktop: 'header-desktop',
    headerBack: 'header-back',
    headerTitle: 'header-title',
    languageButton: 'language-button',
    language: (locale: string) => `language-${locale}`,
    signOut: 'sign-out',
    homeAddBot: 'home-add-bot',
    homeGroupCard: 'home-group-card',
    // Group picker (sheet on phones / Mini App, popover in the sidebar).
    groupChip: 'group-chip',
    groupSheet: 'group-sheet',
    groupPopover: 'group-popover',
    groupSearch: 'group-search',
    groupOption: (groupId: number) => `group-option-${groupId}`,
    groupAddAnother: 'group-add-another',
    moderationAuditLink: 'moderation-audit-link',
    toast: 'toast',
} as const;
