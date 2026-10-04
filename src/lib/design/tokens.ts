// Cookiebot design tokens — the single source both WebHub designs (v1, v2)
// and tailwind.config.ts read. Values come from the "COOKIEBOT UI 3" design
// system; add a token here rather than a hex in a component.

export const colors = {
    'brown-900': '#3A2601',
    'brown-800': '#4A3408',
    'brown-700': '#5E410D',
    'brown-500': '#8A6A2E',
    olive: '#9D844E',
    sand: '#B49A6A',
    line: '#CDB896',
    muted: '#6E5530',
    'cream-200': '#E9D4B3',
    'cream-100': '#FFE9C9',
    'cream-50': '#FFF6E8',
    peach: '#FBE3CC',
    ink: '#2A1B01',
    'slate-900': '#262D33',
    'gray-600': '#6E7781',
    nav: '#F6F6F6',
    telegram: '#037EE5',
    danger: '#B3261E',
    success: '#7BD389',
    warning: '#FFB35C',
} as const;

export const radii = {
    'cb-sm': '8px',
    'cb-md': '12px',
    'cb-lg': '18px',
    'cb-xl': '22px',
    'cb-2xl': '26px',
} as const;

export const shadows = {
    'cb-card': '0 8px 24px rgba(58, 38, 1, 0.08)',
    'cb-raised': '0 14px 30px rgba(58, 38, 1, 0.14)',
    'cb-float': '0 18px 40px rgba(0, 0, 0, 0.30)',
    'cb-sheet': '0 -10px 40px rgba(0, 0, 0, 0.25)',
} as const;

const ease = 'cubic-bezier(.2,.8,.2,1)';
const spring = 'cubic-bezier(.2,.9,.25,1)';

export const keyframes = {
    'cb-rise': { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'none' } },
    'cb-in': { from: { opacity: '0', transform: 'translateX(16px)' }, to: { opacity: '1', transform: 'none' } },
    'cb-fade': { from: { opacity: '0' }, to: { opacity: '1' } },
    'cb-sheet': { from: { transform: 'translateY(100%)' }, to: { transform: 'none' } },
    'cb-pop': { from: { opacity: '0', transform: 'scale(.96) translateY(-4px)' }, to: { opacity: '1', transform: 'none' } },
    'cb-bar': { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'none' } },
} as const;

export const animation = {
    'cb-rise': `cb-rise .42s ${ease} both`,
    'cb-in': `cb-in .32s ${ease} both`,
    'cb-fade': 'cb-fade .24s ease both',
    'cb-sheet': `cb-sheet .34s ${spring} both`,
    'cb-pop': `cb-pop .2s ${spring} both`,
    'cb-bar': `cb-bar .3s ${spring} both`,
} as const;

// Group avatars: a stable tone per group from the brand palette.
const AVATAR_TONES = [colors['brown-700'], colors['brown-500'], colors['slate-900'], colors['brown-900']];

export function groupTone(groupId: number): string {
    return AVATAR_TONES[Math.abs(groupId) % AVATAR_TONES.length];
}

export function initials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);
    return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
}
