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
    toast: 'toast',
} as const;
