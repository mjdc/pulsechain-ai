import { create } from 'zustand';

interface WalletState {
  connected: boolean;
  address: string | null;
  balance: string;
  chainId: string | undefined;
  isConnecting: boolean;
  
  // Actions
  setConnected: (address: string, balance: string, chainId: string) => void;
  setDisconnected: () => void;
  setIsConnecting: (isConnecting: boolean) => void;
  updateBalance: (balance: string) => void;
  updateChainId: (chainId: string) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  connected: false,
  address: null,
  balance: "0.00",
  chainId: undefined,
  isConnecting: false,

  setConnected: (address, balance, chainId) => set({ 
    connected: true, 
    address, 
    balance, 
    chainId,
    isConnecting: false 
  }),

  setDisconnected: () => set({ 
    connected: false, 
    address: null, 
    balance: "0.00", 
    chainId: undefined,
    isConnecting: false 
  }),

  setIsConnecting: (isConnecting) => set({ isConnecting }),
  
  updateBalance: (balance) => set({ balance }),
  
  updateChainId: (chainId) => set({ chainId }),
}));
