'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { CbError } from '@/lib/cb/client';
import { changedFields, GroupConfig, GroupText } from '@/lib/cb/repository';
import { useWebHub } from './WebHubProvider';

type Texts = Partial<Record<GroupText, string>>;

// v1 returns to the Set Up screen after saving; v2 stays put and confirms
// with a toast, so it asks for `stayOnSave` and reads `save()`'s result.
export function useGroupConfig(textKinds: GroupText[] = [], { stayOnSave = false } = {}) {
    const router = useRouter();
    const { repo, groupId } = useWebHub();
    const [original, setOriginal] = useState<GroupConfig | null>(null);
    const [config, setConfig] = useState<GroupConfig | null>(null);
    const [originalTexts, setOriginalTexts] = useState<Texts>({});
    const [texts, setTexts] = useState<Texts>({});
    const [error, setError] = useState<{ status: number; detail: string } | null>(null);
    const [saving, setSaving] = useState(false);
    const kinds = textKinds.join(',');

    useEffect(() => {
        if (groupId === null) return;
        let cancelled = false;
        setError(null);
        setConfig(null);
        (async () => {
            const loaded = await repo.getConfig(groupId);
            const loadedTexts: Texts = {};
            for (const kind of kinds ? (kinds.split(',') as GroupText[]) : []) {
                loadedTexts[kind] = (await repo.getText(groupId, kind)) ?? '';
            }
            if (cancelled) return;
            setOriginal(loaded);
            setConfig(loaded);
            setOriginalTexts(loadedTexts);
            setTexts(loadedTexts);
        })().catch((e) => {
            if (!cancelled) setError(e instanceof CbError ? { status: e.status, detail: e.detail } : { status: 0, detail: String(e) });
        });
        return () => { cancelled = true; };
    }, [repo, groupId, kinds]);

    const update = useCallback(<K extends keyof GroupConfig>(key: K, value: GroupConfig[K]) => {
        setConfig((current) => (current ? { ...current, [key]: value } : current));
    }, []);

    const updateText = useCallback((kind: GroupText, value: string) => {
        setTexts((current) => ({ ...current, [kind]: value }));
    }, []);

    const save = useCallback(async (): Promise<boolean> => {
        if (!original || !config || groupId === null) return false;
        const patch = changedFields(original, config);
        const changedTexts = (Object.keys(texts) as GroupText[]).filter((kind) => texts[kind] !== originalTexts[kind]);
        setSaving(true);
        setError(null);
        try {
            if (Object.keys(patch).length > 0) {
                const saved = await repo.patchConfig(groupId, patch);
                setOriginal(saved);
                if (stayOnSave) setConfig(saved);
            }
            for (const kind of changedTexts) await repo.putText(groupId, kind, texts[kind] ?? '');
            setOriginalTexts(texts);
            if (!stayOnSave) router.push('/dashboard');
            return true;
        } catch (e) {
            // Keep the edited values so a 422 can be fixed in place.
            setError(e instanceof CbError ? { status: e.status, detail: e.detail } : { status: 0, detail: String(e) });
            return false;
        } finally {
            setSaving(false);
        }
    }, [original, config, texts, originalTexts, groupId, repo, router, stayOnSave]);

    const discard = useCallback(() => {
        setConfig(original);
        setTexts(originalTexts);
        setError(null);
    }, [original, originalTexts]);

    const dirtyCount = (original && config ? Object.keys(changedFields(original, config)).length : 0)
        + (Object.keys(texts) as GroupText[]).filter((kind) => texts[kind] !== originalTexts[kind]).length;

    return { config, texts, update, updateText, save, discard, dirtyCount, saving, error };
}
