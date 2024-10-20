import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import * as web3 from "@solana/web3.js";
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { SolanaTracker } from '../SolanaTracker';
import '../App.css';
import { FaExchangeAlt, FaCog, FaChevronDown, FaSearch, FaTimes, FaSun, FaMoon, FaBars } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import backgroundImageDark from './bgm.jpg';
import backgroundImageLight from './bgwhite.jpg';
import logo from './logo.gif';
import { predefinedTokens } from './predefinedTokens';
import { socialLinks, partnerLogos, partnerLogosBottom } from './partners';

interface Token {
  symbol: string;
  address: string;
  logo?: string;
  name: string;
  price: number;
  priceChange24h: number;
  balance?: number;
}

export default function Component() {
  const { publicKey, sendTransaction } = useWallet();
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState('1');
  const [customSlippage, setCustomSlippage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showTokenSelector, setShowTokenSelector] = useState<'from' | 'to' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tokens, setTokens] = useState<Token[]>(predefinedTokens);
  const [customToken, setCustomToken] = useState<Token | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasShownWalletConnectedToast, setHasShownWalletConnectedToast] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const fetchTokenData = useCallback(async (tokensToFetch: Token[]) => {
    try {
      const updatedTokens = await Promise.all(tokensToFetch.map(async (token) => {
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${token.address}`);
        const data = await response.json();
        
        if (data.pairs && data.pairs.length > 0) {
          const pairData = data.pairs[0];
          return {
            ...token,
            price: parseFloat(pairData.priceUsd) || token.price,
            priceChange24h: parseFloat(pairData.priceChange.h24) || token.priceChange24h,
            logo: pairData.info?.imageUrl || token.logo,
          };
        }
        return token;
      }));

      return updatedTokens;
    } catch (error) {
      console.error('Error fetching token data:', error);
      return tokensToFetch;
    }
  }, []);

  const fetchTokenBalance = useCallback(async (token: Token, walletPublicKey: web3.PublicKey): Promise<number> => {
    const solana = new web3.Connection("https://alpha-responsive-uranium.solana-mainnet.quiknode.pro/85df3f357dba323cbe4b53c20e0ab976796a47f6");

    try {
      if (token.symbol === 'SOL') {
        const balance = await solana.getBalance(walletPublicKey);
        return balance / web3.LAMPORTS_PER_SOL;
      } else {
        const tokenMintAddress = new web3.PublicKey(token.address);
        const associatedTokenAddress = await getAssociatedTokenAddress(
          tokenMintAddress,
          walletPublicKey
        );
        
        try {
          const tokenAmount = await solana.getTokenAccountBalance(associatedTokenAddress);
          return parseFloat(tokenAmount.value.uiAmount?.toString() || '0');
        } catch (tokenError) {
          console.error(`Error fetching token balance for ${token.symbol}:`, tokenError);
          return 0;
        }
      }
    } catch (error) {
      console.error(`Error fetching balance for ${token.symbol}:`, error);
      return 0;
    }
  }, []);

  const fetchBalances = useCallback(async (tokensToFetch: Token[]) => {
    if (!publicKey) return tokensToFetch;

    const updatedTokens = await Promise.all(tokensToFetch.map(async (token) => {
      const balance = await fetchTokenBalance(token, publicKey);
      return { ...token, balance };
    }));

    return updatedTokens;
  }, [publicKey, fetchTokenBalance]);

  const updateTokens = useCallback(async (tokensToUpdate: Token[]) => {
    const tokensWithPrices = await fetchTokenData(tokensToUpdate);
    const tokensWithBalances = await fetchBalances(tokensWithPrices);
    setTokens(prevTokens => {
      const updatedTokens = prevTokens.map(token => {
        const updatedToken = tokensWithBalances.find(t => t.address === token.address);
        return updatedToken || token;
      });
      return updatedTokens;
    });
    return tokensWithBalances;
  }, [fetchTokenData, fetchBalances]);

  useEffect(() => {
    const initializeTokens = async () => {
      const solToken = tokens.find(t => t.symbol === 'SOL');
      const pinkyToken = tokens.find(t => t.symbol === 'PINKY');
      const rayToken = tokens.find(t => t.symbol === 'RAY');
      const usdcToken = tokens.find(t => t.symbol === 'USDC');

      if (solToken && pinkyToken && rayToken && usdcToken) {
        const tokensToUpdate = [solToken, pinkyToken, rayToken, usdcToken];
        const updatedTokens = await updateTokens(tokensToUpdate);

        if (!fromToken) {
          setFromToken(updatedTokens.find(t => t.symbol === 'SOL') || null);
        }
        if (!toToken) {
          setToToken(updatedTokens.find(t => t.symbol === 'PINKY') || null);
        }
      }
    };

    initializeTokens();
  }, [updateTokens]);

  useEffect(() => {
    if (amount && fromToken && toToken) {
      const fromValue = parseFloat(amount) * fromToken.price;
      const toValue = fromValue / toToken.price;
      setToAmount(toValue.toFixed(6));
    } else if (!amount) {
      setToAmount('');
    }
  }, [amount, fromToken, toToken]);

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  useEffect(() => {
    if (publicKey && !hasShownWalletConnectedToast) {
      toast.success('Wallet connected successfully!');
      setHasShownWalletConnectedToast(true);
    }
  }, [publicKey, hasShownWalletConnectedToast]);

  const setPercentageAmount = (percentage: number, isFromToken: boolean) => {
    const token = isFromToken ? fromToken : toToken;
    if (token && token.balance !== undefined) {
      const calculatedAmount = (token.balance * percentage).toFixed(9);
      if (isFromToken) {
        setAmount(calculatedAmount);
      } else {
        setToAmount(calculatedAmount);
        if (fromToken && toToken) {
          const newFromAmount = (parseFloat(calculatedAmount) * toToken.price / fromToken.price).toFixed(6);
          setAmount(newFromAmount);
        }
      }
    }
  };

  const handleSwap = async () => {
    if (!publicKey || !fromToken || !toToken) return;

    try {
      const solana = new web3.Connection("https://alpha-responsive-uranium.solana-mainnet.quiknode.pro/85df3f357dba323cbe4b53c20e0ab976796a47f6");
      const solanaTracker = new SolanaTracker(
        solana,
        'f74df995-dea5-4427-bcd1-f8be8c1c1d6f'
      );

      const swapResponse = await solanaTracker.getSwapInstructions(
        fromToken.address,
        toToken.address,
        parseFloat(amount),
        parseFloat(slippage),
        publicKey.toBase58(),
        0.0005 // Priority fee
      );

      const transactionData = Uint8Array.from(atob(swapResponse.txn), c => c.charCodeAt(0));
      const transaction = web3.Transaction.from(transactionData);

      const signature = await sendTransaction(transaction, solana);
      toast.success(
        <div>
          Transaction successful!{' '}
          <a href={`https://solscan.io/tx/${signature}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
            View on Solscan
          </a>
        </div>
      );
    } catch (error) {
      console.error('Swap error:', error);
      toast.error('Swap failed. Please check your balance and try again.');
    }
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length === 44) {
      await fetchCustomToken(value);
    }
  };

  const fetchCustomToken = async (address: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
      const data = await response.json();

      if (data.pairs && data.pairs.length > 0) {
        const pairData = data.pairs[0];
        const newToken: Token = {
          symbol: pairData.baseToken.symbol,
          address: pairData.baseToken.address,
          logo: pairData.info?.imageUrl,
          name: pairData.baseToken.name,
          price: parseFloat(pairData.priceUsd),
          priceChange24h: parseFloat(pairData.priceChange.h24),
        };

        const updatedToken = await updateTokens([newToken]);
        const finalToken = updatedToken[0];

        setCustomToken(finalToken);
        setTokens(prevTokens => [finalToken, ...prevTokens]);
        
        if (showTokenSelector === 'from') {
          setFromToken(finalToken);
        } else if (showTokenSelector === 'to') {
          setToToken(finalToken);
        }
        
        setSearchTerm('');
      }
    } catch (error) {
      console.error('Error fetching custom token:', error);
      toast.error('Failed to fetch custom token');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTokens = tokens.filter(token =>
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.address.toLowerCase() === searchTerm.toLowerCase()
  );

  const formatPrice = (price: number) => {
    if (price === 0) return '0';
    if (price < 0.000001) {
      return price.toFixed(9).replace(/\.?0+$/, '');
    }
    const priceString = price.toString();
    const [integerPart, decimalPart] = priceString.split('.');
    if (!decimalPart) return integerPart;
    const significantPart = decimalPart.match(/[1-9]/);
    if (!significantPart) return integerPart;
    const significantIndex = significantPart.index!;
    return `${integerPart}.${decimalPart.slice(0, Math.max(significantIndex + 4, 8))}`;
  };

  const TokenSelector: React.FC<{
    token: Token | null;
    onClick: () => void;
  }> = ({ token, onClick }) => (
    <button
      onClick={onClick}
      className="flex items-center space-x-2 bg-white bg-opacity-20 backdrop-blur-md rounded-xl px-3 py-2"
    >
      {token ? (
        <>
          {token.logo ? (
            <img src={token.logo} alt={token.symbol} className="w-6 h-6 rounded-full" />
          ) : (
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {token.name.charAt(0)}
            </div>
          )}
          <span className="text-white">{token.symbol}</span>
        </>
      ) : (
        <span className="text-white">Select</span>
      )}
      <FaChevronDown className="w-4 h-4 text-white" />
    </button>
  );

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSwitchTokens = async () => {
    const newFromToken = toToken;
    const newToToken = fromToken;
    setFromToken(newFromToken);
    setToToken(newToToken);
    setAmount(toAmount);
    setToAmount(amount);

    if (newFromToken && newToToken) {
      const updatedTokens = await updateTokens([newFromToken, newToToken]);
      setFromToken(updatedTokens.find(t => t.address === newFromToken.address) || newFromToken);
      setToToken(updatedTokens.find(t => t.address === newToToken.address) || newToToken);
    }
  };

  const handleSetCustomSlippage = () => {
    if (customSlippage) {
      setSlippage(customSlippage);
      setCustomSlippage('');
    }
  };

  const handlePumpFunClick = () => {
    setShowComingSoon(true);
    setTimeout(() => setShowComingSoon(false), 

 3000);
  };

  return (
    <div id='hero' className={`min-h-screen bg-cover transition-all duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`} style={{backgroundImage: `url(${isDarkMode ? backgroundImageDark : backgroundImageLight})`}}>
      <div className={`min-h-screen ${isDarkMode ? 'bg-black bg-opacity-50' : 'bg-white bg-opacity-50'} backdrop-blur-sm`}>
        <header className="p-4 flex justify-between items-center">
          <img src={logo} alt="PINKY Logo" style={{ maxWidth: '25%' }} />
          <div className="flex items-center space-x-6">
            <nav className="hidden md:block">
              <ul className="flex space-x-6">
                <li>
                  <a href="#" className="text-white hover:text-pink-400 transition-colors duration-300 relative group">
                    Home
                    <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-400  transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
                <li>
                  <a href="https://t.me/Pinky_Trading_Bot" target="_blank" rel="noopener noreferrer" className="text-white hover:text-pink-400 transition-colors duration-300 relative group">
                    Pinky Trading Bot
                    <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-400 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
                <li>
                  <button 
                    onClick={handlePumpFunClick}
                    className="text-white hover:text-pink-400 transition-colors duration-300 relative group"
                  >
                    Pinky Pump
                    <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-400 transition-all duration-300 group-hover:w-full"></span>
                  </button>
                </li>
              </ul>
            </nav>
            <button onClick={toggleMobileMenu} className="md:hidden text-white">
              <FaBars className="w-6 h-6" />
            </button>

            {showMobileMenu && (
              <div className={`fixed inset-0 z-50 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} bg-opacity-95 overflow-y-auto`}>
                <div className="flex flex-col items-center justify-start h-full pt-16">
                  <button onClick={toggleMobileMenu} className="absolute top-4 right-4 text-white">
                    <FaTimes className="w-6 h-6" />
                  </button>
                  <nav>
                    <ul className="flex flex-col space-y-6 text-center">
                      <li>
                        <a href="#" onClick={toggleMobileMenu} className={`text-2xl ${isDarkMode ? 'text-white' : 'text-black'} hover:text-pink-400 transition-colors duration-300`}>
                          Home
                        </a>
                      </li>
                      <li>
                        <a href="https://t.me/Pinky_Trading_Bot" target="_blank" rel="noopener noreferrer" onClick={toggleMobileMenu} className={`text-2xl ${isDarkMode ? 'text-white' : 'text-black'}   hover:text-pink-400 transition-colors duration-300`}>
                          Pinky Trading Bot
                        </a>
                      </li>
                      <li>
                        <button 
                          onClick={() => {
                            handlePumpFunClick();
                            toggleMobileMenu();
                          }}
                          className={`text-2xl ${isDarkMode ? 'text-white' : 'text-black'} hover:text-pink-400 transition-colors duration-300`}
                        >
                          Pinky Pump
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            )}
            <button onClick={toggleDarkMode} className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800  hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} text-white`}>
              {isDarkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5 text-gray-800" />}
            </button>
            <WalletMultiButton className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-2 px-4 rounded" />
          </div>
        </header>
        <main className="flex flex-col items-center mt-10">
          <div className="mb-6 text-center">
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>Buy Pinky On:</h2>
            <div className="flex justify-center space-x-4">
              {partnerLogos.map((partner, index) => (
                <a key={index} href={partner.url} target="_blank" rel="noopener noreferrer" className="transition-transform duration-200 ease-in-out transform hover:scale-110">
                  <img src={partner.logo} alt={partner.name} className="w-12 h-12 rounded-full" />
                </a>
              ))}
            </div>
          </div>


          <div className={`${isDarkMode ? 'bg-gray-800 bg-opacity-80' : 'bg-white'} rounded-2xl shadow-xl p-6 w-96`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>Swap</h2>
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>{slippage}%</span>
                <button onClick={() => setShowSettings(!showSettings)}>
                  <FaCog className={`w-4 h-4 ${isDarkMode ? 'text-white' : 'text-black'}`} />
                </button>
              </div>
            </div>

            {showSettings && (
              <div className={`mb-4 p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-xl`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>Slippage tolerance: {slippage}%</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      className={`w-20 ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-black'} rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      value={customSlippage}
                      onChange={(e) => setCustomSlippage(e.target.value)}
                      placeholder="Custom"
                      step="0.1"
                    />
                    <button
                      onClick={handleSetCustomSlippage}
                      className="bg-blue-500 text-white px-2 py-1 rounded-xl hover:bg-blue-600"
                    >
                      Set
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-4">
              <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-xl p-4`}>
                <div className="flex justify-between items-center mb-2">
                  <input
                    type="number"
                    className={`w-2/3 bg-transparent text-3xl focus:outline-none ${isDarkMode ? 'text-white' : 'text-black'}`}
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <TokenSelector
                    token={fromToken}
                    onClick={() => setShowTokenSelector('from')}
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex justify-between items-center">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {amount && fromToken ? formatPrice(parseFloat(amount) * fromToken.price) : '0.00'} 
                      {fromToken && `(${formatPrice(fromToken.price)})`}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Balance: {fromToken && fromToken.balance !== undefined ? (fromToken.balance === 0 ? '0.00' : fromToken.balance.toFixed(6)) : '0.00'} {fromToken && fromToken.symbol}
                    </p>
                  </div>
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => setPercentageAmount(0.5, true)}
                      className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      50%
                    </button>
                    <button
                      onClick={() => setPercentageAmount(1, true)}
                      className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      MAX
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <button 
                  onClick={handleSwitchTokens}
                  className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} text-white`}
                >
                  <FaExchangeAlt className="w-4 h-4" />
                </button>
              </div>
              <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-xl p-4`}>
                <div className="flex justify-between items-center mb-2">
                  <input
                    type="number"
                    className={`w-2/3 bg-transparent text-3xl focus:outline-none ${isDarkMode ? 'text-white' : 'text-black'}`}
                    placeholder="0.00"
                    value={toAmount}
                    onChange={(e) => {
                      setToAmount(e.target.value);
                      if (fromToken && toToken) {
                        const newFromAmount = (parseFloat(e.target.value) * toToken.price / fromToken.price).toFixed(6);
                        setAmount(newFromAmount);
                      }
                    }}
                  />
                  <TokenSelector
                    token={toToken}
                    onClick={() => setShowTokenSelector('to')}
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex justify-between items-center">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {toAmount && toToken ? formatPrice(parseFloat(toAmount) * toToken.price) : '0.00'} 
                      {toToken && `(${formatPrice(toToken.price)})`}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Balance: {toToken && toToken.balance !== undefined ? (toToken.balance === 0 ? '0.00' : toToken.balance.toFixed(6)) : '0.00'} {toToken && toToken.symbol}
                    </p>
                  </div>
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => setPercentageAmount(0.5, false)}
                      className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      50%
                    </button>
                    <button
                      onClick={() => setPercentageAmount(1, false)}
                      className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      MAX
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={handleSwap}
                disabled={!publicKey || !fromToken || !toToken}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-2 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaExchangeAlt className="w-4 h-4" />
                <span>Swap</span>
              </button>
            </div>
          </div>
        </main>
        
        <div className="flex justify-center mt-6 space-x-4">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-transform duration-200 ease-in-out transform hover:scale-110`}
            >
              <link.icon className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />
            </a>
          ))}
        </div>
        
        {showTokenSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6 w-[480px] max-h-[80vh] overflow-y-auto`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>Select a token</h3>
                <button onClick={() => setShowTokenSelector(null)}>
                  <FaTimes className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-black'}`} />
                </button>
              </div>
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search by name, symbol or address"
                  className={`w-full ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'} rounded-xl p-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </div>
              <div className="space-y-2">
                {isLoading ? (
                  <div className={`text-center ${isDarkMode ? 'text-white' : 'text-black'}`}>Loading...</div>
                ) : (
                  filteredTokens.map((token) => (
                    <button
                      key={token.address}
                      className={`flex items-center justify-between w-full p-3 hover:bg-gray-700 rounded-xl ${isDarkMode ? 'text-white bg-gray-700' : 'text-black bg-gray-100'} mb-2 transition-transform duration-200 ease-in-out transform hover:scale-105`}
                      onClick={() => {
                        if (showTokenSelector === 'from') {
                          setFromToken(token);
                        } else {
                          setToToken(token);
                        }
                        setShowTokenSelector(null);
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        {token.logo ? (
                          <img src={token.logo} alt={token.symbol} className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {token.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{token.symbol}</span>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{token.name}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-medium">{formatPrice(token.price)}</span>
                        <span className={`text-xs ${token.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          
        )}

<div className="mt-12 w-full max-w-2xl" style={{ display: 'inline-block' }}> {/* Reduced max-width for 70% smaller */}
            <h3 className={`text-xl font-bold mb-4 text-center ${isDarkMode ? 'text-white' : 'text-black'}`}>Our Partners</h3>
            <div className="grid grid-cols-8 gap-6"> {/* Changed to 4 columns */}
              {partnerLogosBottom.map((partner, index) => (
                <a
                  key={index}
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transform transition-all duration-300 hover:scale-110"
                >
                  <img
                    src={partner.img}
                    alt={`Partner ${index + 1}`}
                    className="w-full h-auto rounded-lg shadow-lg"
                    style={{
                      animation: `popIn 0.5s ease-out ${index * 0.1}s both`,
                    }}
                  />
                </a>
              ))}
            </div>
          </div>
        {showComingSoon && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} rounded-xl p-6 shadow-xl`}>
              <h3 className="text-2xl font-bold mb-2">Coming Soon!</h3>
              <p>This feature is currently under development.</p>
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
}