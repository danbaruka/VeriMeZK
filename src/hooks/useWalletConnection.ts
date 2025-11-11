import { useWallet, useAddress, useLovelace, useNetwork } from '@meshsdk/react';
import { useEffect, useState } from 'react';

export function useWalletConnection() {
  const { connect, disconnect, connected, name, connecting, error } = useWallet();
  const address = useAddress();
  const lovelace = useLovelace();
  const network = useNetwork();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (connected && address && lovelace) {
      setIsReady(true);
    } else {
      setIsReady(false);
    }
  }, [connected, address, lovelace]);

  return {
    connect,
    disconnect,
    connected,
    name,
    connecting,
    error,
    address,
    lovelace,
    network,
    isReady,
  };
}

