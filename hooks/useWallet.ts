import { useEffect, useCallback } from 'react';
import { useWalletStore } from '../store/walletStore';

export const useWallet = () => {
  const { 
    connected, 
    address, 
    balance, 
    chainId, 
    isConnecting,
    setConnected, 
    setDisconnected, 
    setIsConnecting,
    updateBalance,
    updateChainId
  } = useWalletStore();

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      setIsConnecting(true);
      try {
        // Request Account Access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        
        // Get Chain ID
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        
        // Get Balance
        const balanceHex = await window.ethereum.request({ 
          method: 'eth_getBalance', 
          params: [account, 'latest'] 
        });
        
        // Convert Wei to Eth (Simple division by 10^18)
        const balanceInt = parseInt(balanceHex, 16);
        const balanceEth = (balanceInt / 1e18).toFixed(4);

        setConnected(account, balanceEth, chainIdHex);

      } catch (error) {
        console.error("Connection failed:", error);
        setDisconnected();
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("No crypto wallet found! Please install MetaMask.");
      setIsConnecting(false);
    }
  }, [setConnected, setDisconnected, setIsConnecting]);

  // Auto-detect wallet changes and event listeners
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          connectWallet(); // Re-sync details with new account
        } else {
          setDisconnected();
        }
      };

      const handleChainChanged = () => {
        window.location.reload(); // Recommended by MetaMask
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [connectWallet, setDisconnected]);

  return {
    connected,
    address,
    balance,
    chainId,
    isConnecting,
    connectWallet
  };
};
