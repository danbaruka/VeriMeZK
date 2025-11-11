import { useEffect, useState } from 'react';
import { getMidnightClient, initializeMidnightAPI, getContractState } from '@/lib/midnight/client';
import config from '@/config';

export function useMidnightClient() {
    const [client, setClient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function init() {
            try {
                setLoading(true);
                const providers = await getMidnightClient();
                setClient(providers);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to initialize Midnight client');
            } finally {
                setLoading(false);
            }
        }

        init();
    }, []);

    return { client, loading, error };
}

export function useContractState(contractAddress?: string) {
    const [state, setState] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchState = async () => {
        if (!contractAddress) return;

        try {
            setLoading(true);
            const contractState = await getContractState();
            setState(contractState);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch contract state');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (contractAddress) {
            fetchState();
        }
    }, [contractAddress]);

    return { state, loading, error, refetch: fetchState };
}

