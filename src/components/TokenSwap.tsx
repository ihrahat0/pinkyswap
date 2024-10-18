import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import * as web3 from "@solana/web3.js";
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { SolanaTracker } from '../SolanaTracker';
import '../App.css';
import { FaExchangeAlt, FaCog, FaChevronDown, FaSearch, FaTimes, FaSun, FaMoon, FaTelegram, FaGlobe, FaBars } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
import { Instagram, Youtube } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import backgroundImageDark from './bgm.jpg';
import backgroundImageLight from './bgwhite.jpg';
import logo from './logo.gif';

interface Token {
  symbol: string;
  address: string;
  logo?: string;
  name: string;
  price: number;
  priceChange24h: number;
  balance?: number;
}

const predefinedTokens: Token[] = [
  { symbol: 'SOL', address: 'So11111111111111111111111111111111111111112', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png', name: 'Wrapped SOL', price: 0, priceChange24h: 0 },
  { symbol: 'PINKY', address: '9c4eyXdumWCJokq3vHfLWv76grp4emS6zrmfXKvs3N6v', logo: 'https://dd.dexscreener.com/ds-data/tokens/solana/9c4eyXdumWCJokq3vHfLWv76grp4emS6zrmfXKvs3N6v.png', name: 'PINKY', price: 0, priceChange24h: 0 },
  { symbol: 'USDC', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png', name: 'USD Coin', price: 0, priceChange24h: 0 },
  { symbol: 'RAY', address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png', name: 'Raydium', price: 0, priceChange24h: 0 },
  { symbol: 'SRM', address: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt/logo.png', name: 'Serum', price: 0, priceChange24h: 0 },
  { symbol: 'ETH', address: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs/logo.png', name: 'Wrapped Ethereum (Wormhole)', price: 0, priceChange24h: 0 },
  { symbol: 'GENE', address: 'GENEtH5amGSi8kHAtQoezp1XEXwZJ8vcuePYnXdKrMYz', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/GENEtH5amGSi8kHAtQoezp1XEXwZJ8vcuePYnXdKrMYz/logo.png', name: 'Genopets', price: 0, priceChange24h: 0 },
  { symbol: 'COPE', address: '8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh/logo.png', name: 'COPE', price: 0, priceChange24h: 0 },
  { symbol: 'STEP', address: 'StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT/logo.png', name: 'Step', price: 0, priceChange24h: 0 },
  { symbol: 'SLND', address: 'SLNDpmoWTVADgEdndyvWzroNL7zSi1dF9PC3xHGtPwp', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SLNDpmoWTVADgEdndyvWzroNL7zSi1dF9PC3xHGtPwp/logo.png', name: 'Solend', price: 0, priceChange24h: 0 },
  { symbol: 'MEDIA', address: 'ETAtLmCmsoiEEKfNrHKJ2kYy3MoABhU6NQvpSfij5tDs', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/ETAtLmCmsoiEEKfNrHKJ2kYy3MoABhU6NQvpSfij5tDs/logo.png', name: 'Media Network', price: 0, priceChange24h: 0 },
  { symbol: 'MER', address: 'MERt85fc5boKw3BW1eYdxonEuJNvXbiMbs6hvheau5K', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/MERt85fc5boKw3BW1eYdxonEuJNvXbiMbs6hvheau5K/logo.png', name: 'Mercurial', price: 0, priceChange24h: 0 },
  { symbol: 'SLIM', address: 'xxxxa1sKNGwFtw2kFn8XauW9xq8hBZ5kVtcSesTT9fW', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/xxxxa1sKNGwFtw2kFn8XauW9xq8hBZ5kVtcSesTT9fW/logo.png', name: 'Solanium', price: 0, priceChange24h: 0 },
  { symbol: 'ATLAS', address: 'ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx/logo.png', name: 'Star Atlas', price: 0, priceChange24h: 0 },
  { symbol: 'POLIS', address: 'poLisWXnNRwC6oBu1vHiuKQzFjGL4XDSu4g9qjz9qVk', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/poLisWXnNRwC6oBu1vHiuKQzFjGL4XDSu4g9qjz9qVk/logo.png', name: 'Star Atlas DAO', price: 0, priceChange24h: 0 },
  { symbol: 'BOP', address: 'BLwTnYKqf7u4qjgZrrsKeNs2EzWkMLqVCu6j8iHyrNA3', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BLwTnYKqf7u4qjgZrrsKeNs2EzWkMLqVCu6j8iHyrNA3/logo.png', name: 'Boring Protocol', price: 0, priceChange24h: 0 },
  { symbol: 'SAMO', address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU/logo.png', name: 'Samoyedcoin', price: 0, priceChange24h: 0 },
  { symbol: 'ORCA', address: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png', name: 'Orca', price: 0, priceChange24h: 0 },
  { symbol: 'FTT', address: 'AGFEad2et2ZJif9jaGpdMixQqvW5i81aBdvKe7PHNfz3', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/AGFEad2et2ZJif9jaGpdMixQqvW5i81aBdvKe7PHNfz3/logo.png', name: 'FTX Token (Wormhole)', price: 0, priceChange24h: 0 },
  { symbol: 'LARIX', address: 'Lrxqnh6ZHKbGy3dcrCED43nsoLkM1LTzU2jRfWe8qUC', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Lrxqnh6ZHKbGy3dcrCED43nsoLkM1LTzU2jRfWe8qUC/logo.png', name: 'Larix', price: 0, priceChange24h: 0 },
  { symbol: 'GRAPE', address: '8upjSpvjcdpuzhfR1zriwg5NXkwDruejqNE9WNbPRtyA', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/8upjSpvjcdpuzhfR1zriwg5NXkwDruejqNE9WNbPRtyA/logo.png', name: 'Grape Protocol', price: 0, priceChange24h: 0 },
  { symbol: 'PORT', address: 'PoRTjZMPXb9T7dyU7tpLEZRQj7e6ssfAE62j2oQuc6y', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/PoRTjZMPXb9T7dyU7tpLEZRQj7e6ssfAE62j2oQuc6y/logo.png', name: 'Port Finance', price: 0, priceChange24h: 0 },
  { symbol:  'MSOL', address: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png', name: 'Marinade staked SOL (mSOL)', price: 0, priceChange24h: 0 },
  { symbol: 'SUSHI', address: 'AR1Mtgh7zAtxuxGd2XPovXPVjcSdY3i4rQYisNadjfKy', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/AR1Mtgh7zAtxuxGd2XPovXPVjcSdY3i4rQYisNadjfKy/logo.png', name: 'Sushi Token (Wormhole)', price: 0, priceChange24h: 0 },
  { symbol: 'PAI', address: 'Ea5SjE2Y6yvCeW5dYTn7PYMuW5rRDPq5XdG655MuAlJ', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Ea5SjE2Y6yvCeW5dYTn7PYMuW5rRDPq5XdG655MuAlJ/logo.png', name: 'PAI (Parrot USD)', price: 0, priceChange24h: 0 },
  { symbol: 'MNDE', address: 'MNDEFzGvMt87ueuHvVU9VcTqsAP5b3fTGPsHuuPA5ey', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/MNDEFzGvMt87ueuHvVU9VcTqsAP5b3fTGPsHuuPA5ey/logo.png', name: 'Marinade', price: 0, priceChange24h: 0 },
  { symbol: 'LIQ', address: '4wjPQJ6PrkC4dHhYghwJzGBVP78DkBzA2U3kHoFNBuhj', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4wjPQJ6PrkC4dHhYghwJzGBVP78DkBzA2U3kHoFNBuhj/logo.png', name: 'LIQ Protocol', price: 0, priceChange24h: 0 },
  { symbol: 'SNY', address: '4dmKkXNHdgYsXqBHCuMikNQWwVomZURhYvkkX5c4pQ7y', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4dmKkXNHdgYsXqBHCuMikNQWwVomZURhYvkkX5c4pQ7y/logo.png', name: 'Synthetify', price: 0, priceChange24h: 0 },
  { symbol: 'SUNNY', address: 'SUNNYWgPQmFxe9wTZzNK7iPnJ3vYDrkgnxJRJm1s3ag', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SUNNYWgPQmFxe9wTZzNK7iPnJ3vYDrkgnxJRJm1s3ag/logo.png', name: 'Sunny Governance Token', price: 0, priceChange24h: 0 },
  { symbol: 'GOFX', address: 'GFX1ZjR2P15tmrSwow6FjyDYcEkoFb4p4gJCpLBjaxHD', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/GFX1ZjR2P15tmrSwow6FjyDYcEkoFb4p4gJCpLBjaxHD/logo.png', name: 'GooseFX', price: 0, priceChange24h: 0 },
  { symbol: 'WOOF', address: '9nEqaUcb16sQ3Tn1psbkWqyhPdLmfHWjKGymREjsAgTE', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9nEqaUcb16sQ3Tn1psbkWqyhPdLmfHWjKGymREjsAgTE/logo.png', name: 'WOOF', price: 0, priceChange24h: 0 },
  { symbol: 'XTAG', address: '5gs8nf4wojB5EXgDUWNLwXpknzgV2YWDhveAeBZpVLbp', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/5gs8nf4wojB5EXgDUWNLwXpknzgV2YWDhveAeBZpVLbp/logo.png', name: 'xHashtag', price: 0, priceChange24h: 0 },
  { symbol: 'ALEPH', address: 'CsZ5LZkDS7h9TDKjrbL7VAwQZ9nsRu8vJLhRYfmGaN8K', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/CsZ5LZkDS7h9TDKjrbL7VAwQZ9nsRu8vJLhRYfmGaN8K/logo.png', name: 'Aleph.im (Wormhole v1)', price: 0, priceChange24h: 0 },
  { symbol: 'SBR', address: 'Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1/logo.png', name: 'Saber Protocol Token', price: 0, priceChange24h: 0 },
  { symbol: 'SLRS', address: 'SLRSSpSLUTP7okbCUBYStWCo1vUgyt775faPqz8HUMr', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SLRSSpSLUTP7okbCUBYStWCo1vUgyt775faPqz8HUMr/logo.png', name: 'Solrise Finance', price: 0, priceChange24h: 0 },
  { symbol: 'WOO', address: 'E5rk3nmgLUuKUiS94gg4bpWwWwyjCMtddsAXkTFLtHEy', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/E5rk3nmgLUuKUiS94gg4bpWwWwyjCMtddsAXkTFLtHEy/logo.png', name: 'Wootrade Network', price: 0, priceChange24h: 0 },
  { symbol: 'APEX', address: '51tMb3zBKDiQhNwGqpgwbavaGH54mk8fXFzxTc1xnasg', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/51tMb3zBKDiQhNwGqpgwbavaGH54mk8fXFzxTc1xnasg/logo.png', name: 'APEX', price: 0, priceChange24h: 0 },
  { symbol: 'USDT', address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png', name: 'USDT', price: 0, priceChange24h: 0 },
  { symbol: 'UXD', address: '7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT/logo.png', name: 'UXD Stablecoin', price: 0, priceChange24h: 0 },
  { symbol: 'USDH', address: 'USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX/logo.png', name: 'USDH Hubble Stablecoin', price: 0, priceChange24h: 0 },
  { symbol: 'USH', address: '9iLH8T7zoWhY7sBmj1WK9ENbWdS1nL8n9wAxaeRitTa6', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9iLH8T7zoWhY7sBmj1WK9ENbWdS1nL8n9wAxaeRitTa6/logo.png', name: 'Hubble', price: 0, priceChange24h: 0 },
  { symbol: 'SHDW', address: 'SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y/logo.png', name: 'Shadow Token', price: 0, priceChange24h: 0 },
  { symbol: 'BASIS', address: 'Basis9oJw9j8cw53oMV7iqsgo6ihi9ALw4QR31rcjUJa', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Basis9oJw9j8cw53oMV7iqsgo6ihi9ALw4QR31rcjUJa/logo.png', name: 'basis', price: 0, priceChange24h: 0 },
  { symbol: 'GST', address: 'AFbX8oGjGpmVFywbVouvhQSRmiW2aR1mohfahi4Y2AdB', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/AFbX8oGjGpmVFywbVouvhQSRmiW2aR1mohfahi4Y2AdB/logo.png', name: 'GST', price: 0, priceChange24h: 0 },
  { symbol: 'GMT', address: '7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx/logo.png', name: 'STEPN', price: 0, priceChange24h: 0 },
  { symbol: 'BONK', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png', name: 'Bonk', price: 0, priceChange24h: 0 },
  { symbol: 'MEAN', address: 'MEANeD3XDdUmNMsRGjASkSWdC8prLYsoRJ61pPeHctD', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/MEANeD3XDdUmNMsRGjASkSWdC8prLYsoRJ61pPeHctD/logo.png', name: 'Mean', price: 0, priceChange24h: 0 },
  { symbol: 'DUST', address: 'DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ', logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ/logo.png', name: 'DUST Protocol', price: 0, priceChange24h: 0 },
];
const socialLinks = [
  { label: 'Website', url: 'https://www.taptap-pinky.com/', icon: FaGlobe },
  { label: 'X', url: 'https://x.com/Taptap_Pinky', icon: FaXTwitter },
  { label: 'Telegram', url: 'https://t.me/Taptap_Pinky', icon: FaTelegram },
  { label: 'Instagram', url: 'https://www.instagram.com/taptappinky/', icon: Instagram },
  { label: 'Youtube', url: 'https://www.youtube.com/@Taptap-Pinky', icon: Youtube }
];

const partnerLogos = [
  { url: "https://x.com/Orbler1/status/1826899264011993109", img: "https://taptap-pinky.com/_next/static/media/img1.0945a9fd.png" },
  { url: "https://x.com/realDogX/status/1826979011081425204", img: "https://taptap-pinky.com/_next/static/media/img2.ece5ebbe.jpg" },
  { url: "https://x.com/funton_ai/status/1827250857005740081", img: "https://taptap-pinky.com/_next/static/media/img3.eb20dcb5.png" },
  { url: "https://x.com/Taptap_Pinky/status/1829550257031791096", img: "https://taptap-pinky.com/_next/static/media/img4.56ac8080.png" },
  { url: "https://x.com/Taptap_Pinky/status/1828853470872396274", img: "https://taptap-pinky.com/_next/static/media/img5.d323bbaa.jpg" },
  { url: "https://x.com/BBQ_Coin/status/1829482473912476068", img: "https://taptap-pinky.com/_next/static/media/img6.a3eb9815.png" },
  { url: "https://x.com/CollablyNetwork/status/1829101772540965155", img: "https://taptap-pinky.com/_next/static/media/img7.83767f4e.png" },
  { url: "https://x.com/Bitroot_/status/1830442973601108387", img: "https://taptap-pinky.com/_next/static/media/img8.fcb376f3.png" },
  { url: "https://x.com/Taptap_Pinky/status/1829936347588767916", img: "https://taptap-pinky.com/_next/static/media/img9.690dad1e.png" },
  { url: "https://x.com/impulsetoken/status/1829926438448804226", img: "https://taptap-pinky.com/_next/static/media/img10.5533553c.png" },
  { url: "https://x.com/degame_l2y/status/1833489114538381795", img: "https://taptap-pinky.com/_next/static/media/img11.c6f15f6c.png" },
  { url: "https://x.com/dsc_lab/status/1831937974759780505", img: "https://taptap-pinky.com/_next/static/media/img12.39f9da9d.png" },
  { url: "https://x.com/HashKingGlobal/status/1831333576857817108", img: "https://taptap-pinky.com/_next/static/media/img13.a10cf984.png" },
  { url: "https://x.com/0xHabitNetwork/status/1831301844028510398", img: "https://taptap-pinky.com/_next/static/media/img14.61d21bb1.png" },
  { url: "https://x.com/Taptap_Pinky/status/1833981797387862119", img: "https://taptap-pinky.com/_next/static/media/img15.a68c28c8.png" },
  { url: "https://x.com/Taptap_Pinky/status/1833865874219954670", img: "https://taptap-pinky.com/_next/static/media/img16.0b7a7e8c.png" },
  { url: "https://x.com/Taptap_Pinky/status/1833828062200275167", img: "https://taptap-pinky.com/_next/static/media/img17.af23a88a.png" },
  { url: "https://x.com/StakeCore/status/1836425098506702884", img: "https://taptap-pinky.com/_next/static/media/img18.b8860b1e.png" },
  { url: "https://x.com/kokomo_games/status/1836435286303318487", img: "https://taptap-pinky.com/_next/static/media/img19.9db6ff0e.png" },
  { url: "https://x.com/FrogsOnTon/status/1836023225056108749", img: "https://taptap-pinky.com/_next/static/media/img20.937bb07d.png" },
  { url: "https://x.com/CyberChargeWeb3/status/1836692581994164711?t=4tRKZlgWDbnvbB6GN3Jz0g&s=19", img: "https://taptap-pinky.com/_next/static/media/img21.b3f2794d.png" },
  { url: "https://x.com/CoincuInsights/status/1838493602487628126", img: "https://taptap-pinky.com/_next/static/media/img22.02291e23.png" },
  { url: "https://x.com/realHopiumTON/status/1838402705242624222", img: "https://taptap-pinky.com/_next/static/media/img23.25058203.png" },
  { url: "https://x.com/Mhaya_Official/status/1838094459277607282", img: "https://taptap-pinky.com/_next/static/media/img24.fd6809bb.png" },
  { url: "https://x.com/Hi_PoPPOfficial/status/1837400656560508947", img: "https://taptap-pinky.com/_next/static/media/img25.a1e94162.png" },
  { url: "https://x.com/vtradingglobal/status/1837192068659093922", img: "https://taptap-pinky.com/_next/static/media/img26.16c761a6.png" },
  { url: "https://x.com/Petoshi_Blast/status/1838617084256792720", img: "https://taptap-pinky.com/_next/static/media/img27.6348d0db.png" },
  { url: "https://x.com/Taptap_Pinky/status/1841474289125458427?t=CGT1PJUhGOrKeVKl8wXORA&s=19", img: "https://taptap-pinky.com/_next/static/media/img28.0bfd8bfc.png" },
  { url: "https://www.pinksale.finance", img: "https://taptap-pinky.com/_next/static/media/img29.1584d4ad.png" },
  { url: "https://x.com/0xTrikon/status/1840015510706237950", img: "https://taptap-pinky.com/_next/static/media/img31.4f948c77.png" },
  { url: "https://x.com/CwalletOfficial/status/1844222168672141535?t=9m6OzNWP0sw51pNWQhrkSw&s=19", img: "https://taptap-pinky.com/_next/static/media/img32.d7c6c43f.png" },
  { url: "https://x.com/Taptap_Pinky/status/1843989609883087028?t=PJu-65yDBeKY_W0U37TZTw&s=19", img: "https://taptap-pinky.com/_next/static/media/img33.19d962bb.png" },
  { url: "https://x.com/BitMartExchange/status/1842124053210866098?t=jC2JNCc7U0_u19xphROZWA&s=19", img: "https://taptap-pinky.com/_next/static/media/img34.2f912519.png" },
];


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

  useEffect(() => {
    fetchTokenData();
  }, []);

  useEffect(() => {
    if (amount && fromToken && toToken) {
      const fromValue = parseFloat(amount) * fromToken.price;
      const toValue = fromValue / toToken.price;
      setToAmount(toValue.toFixed(6));
    } else if (!amount) {
      setToAmount('');
    }
  }, [amount, fromToken, toToken]);

  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  useEffect(() => {
    if (publicKey && !hasShownWalletConnectedToast) {
      fetchBalances();
      toast.success('Wallet connected successfully!');
      setHasShownWalletConnectedToast(true);
    }
  }, [publicKey, tokens, hasShownWalletConnectedToast]);

  useEffect(() => {
    if (fromToken) {
      setAmount(''); // Reset amount when token changes
    }
  }, [fromToken]);

  const fetchTokenData = async () => {
    try {
      const updatedTokens = await Promise.all(predefinedTokens.map(async (token) => {
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${token.address}`);
        const data = await response.json();
        
        if (data.pairs && data.pairs.length > 0) {
          const pairData = data.pairs[0];
          return {
            ...token,
            price: parseFloat(pairData.priceUsd),
            priceChange24h: parseFloat(pairData.priceChange.h24),
            logo: pairData.info?.imageUrl || token.logo,
          };
        }
        return token;
      }));

      setTokens(updatedTokens);
      setFromToken(updatedTokens[0]);
      setToToken(updatedTokens[1]);
    } catch (error) {
      console.error('Error fetching token data:', error);
      toast.error('Failed to fetch token data');
    }
  };

  const fetchBalances = async () => {
    if (!publicKey) return;

    const updatedTokens = await Promise.all(tokens.map(async (token) => {
      const balance = await fetchTokenBalance(token, publicKey);
      return { ...token, balance: parseFloat(balance.toFixed(9)) };
    }));

    setTokens(updatedTokens);
    if (fromToken) {
      const updatedFromToken = updatedTokens.find(t => t.symbol === fromToken.symbol);
      if (updatedFromToken) {
        setFromToken(updatedFromToken);
      }
    }
  };

  const fetchTokenBalance = async (token: Token, walletPublicKey: web3.PublicKey): Promise<number> => {
    const solana = new web3.Connection("https://muddy-sparkling-seed.solana-mainnet.quiknode.pro/04141016287f05de971dbf54aadd6e4a0931a8bf/");

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
  };

  const setPercentageAmount = (percentage: number) => {
    if (fromToken && fromToken.balance !== undefined) {
      const calculatedAmount = (fromToken.balance * percentage).toFixed(9);
      setAmount(calculatedAmount);
    } else {
      setAmount('0');
    }
  };

  const handleSwap = async () => {
    if (!publicKey || !fromToken || !toToken) return;

    try {
      const solana = new web3.Connection("https://muddy-sparkling-seed.solana-mainnet.quiknode.pro/04141016287f05de971dbf54aadd6e4a0931a8bf/");
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
    if (value.length === 44) { // Solana addresses are 44 characters long
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

        // Fetch balance for the new token
        if (publicKey) {
          const balance = await fetchTokenBalance(newToken, publicKey);
          newToken.balance = balance;
        }

        setCustomToken(newToken);
        setTokens(prevTokens => [newToken, ...prevTokens]);
        
        if (showTokenSelector === 'from') {
          setFromToken(newToken);
        } else if (showTokenSelector === 'to') {
          setToToken(newToken);
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
    const  newFromToken = toToken;
    const newToToken = fromToken;
    setFromToken(newFromToken);
    setToToken(newToToken);
    setAmount(toAmount);
    setToAmount(amount);

    // Fetch latest prices for both tokens
    if (newFromToken && newToToken) {
      try {
        const [fromTokenData, toTokenData] = await Promise.all([
          fetch(`https://api.dexscreener.com/latest/dex/tokens/${newFromToken.address}`).then(res => res.json()),
          fetch(`https://api.dexscreener.com/latest/dex/tokens/${newToToken.address}`).then(res => res.json())
        ]);

        if (fromTokenData.pairs && fromTokenData.pairs.length > 0) {
          setFromToken(prevToken => ({
            ...prevToken!,
            price: parseFloat(fromTokenData.pairs[0].priceUsd),
            priceChange24h: parseFloat(fromTokenData.pairs[0].priceChange.h24)
          }));
        }

        if (toTokenData.pairs && toTokenData.pairs.length > 0) {
          setToToken(prevToken => ({
            ...prevToken!,
            price: parseFloat(toTokenData.pairs[0].priceUsd),
            priceChange24h: parseFloat(toTokenData.pairs[0].priceChange.h24)
          }));
        }
      } catch (error) {
        console.error('Error fetching token prices:', error);
        toast.error('Failed to update token prices');
      }
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
    setTimeout(() => setShowComingSoon(false), 3000);
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
                    <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-400 transition-all duration-300 group-hover:w-full"></span>
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
              <div className="mt-8 grid grid-cols-5 gap-2 px-4">
              <h2 className={`text-2xl font-bold mb-6 text-center ${isDarkMode ? 'text-white' : 'text-black'}`}>Our Partners</h2><br />
                {partnerLogos.map((partner, index) => (
                  <a key={index} href={partner.url} target="_blank" rel="noopener noreferrer" className="block">
                    <img 
                      src={partner.img} 
                      alt={`Partner ${index + 1}`} 
                      className="w-12 h-12 object-contain rounded-lg transform transition-all duration-300 hover:scale-110 animate-pop"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    />
                  </a>
                ))}
              </div>
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
              <a href="https://www.bitmart.com/trade/en-US?type=spot&symbol=PINKY_USDT" target="_blank" rel="noopener noreferrer" className="transition-transform duration-200 ease-in-out transform hover:scale-110">
                <img src="https://static1.bitmart.com/web-frontend-next/public/_next/bitm.nXCN1Htd.png" alt="BitMart" className="w-12 h-12 rounded-full" />
              </a>
              <a href="https://dexscreener.com/solana/9c4eyXdumWCJokq3vHfLWv76grp4emS6zrmfXKvs3N6v" target="_blank" rel="noopener noreferrer" className="transition-transform duration-200 ease-in-out transform hover:scale-110">
                <img src="https://pbs.twimg.com/media/GKkVAKFbAAIcXTP.jpg" alt="DexScreener" className="w-12 h-12 rounded-full" />
              </a>
              <a href="https://www.dextools.io/app/en/solana/pair-explorer/CJiY9Xt2K9akW2nsiiuem8n4YhBY4HbVwRdoPxRrtT7R?t=1728055204011" target="_blank" rel="noopener noreferrer" className="transition-transform duration-200 ease-in-out transform hover:scale-110">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSV73CVyxf_CEA8xb8QVYjbJkuNojXfjXLA-w&s" alt="DexScreener" className="w-12 h-12 rounded-full" />
              </a>
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
                      onClick={() => setPercentageAmount(0.5)}
                      className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      50%
                    </button>
                    <button
                      onClick={() => setPercentageAmount(1)}
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
                <div className="flex justify-between items-center">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {toAmount && toToken ? formatPrice(parseFloat(toAmount) * toToken.price) : '0.00'} 
                    {toToken && `(${formatPrice(toToken.price)})`}
                  </p>
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
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                Get your Token At the Top, <a href="https://t.me/Michelle_Pinky" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Contact Team Pinky</a>
              </p>
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
                        if (showTokenSelector === 'from') setFromToken(token);
                        if (showTokenSelector === 'to') setToToken(token);
                        setShowTokenSelector(null);
                        setSearchTerm('');
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        {token.logo ? (
                          <img src={token.logo} alt={token.symbol} className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {token.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{token.symbol}</span>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{token.name}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div>${formatPrice(token.price)}</div>
                        <div className={`text-sm ${token.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {token.priceChange24h.toFixed(2)}%
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
            
          </div>

          
        )}
        {showComingSoon && (
          <div className="fixed top-20 right-4 bg-pink-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
            Coming Soon!
          </div>
        )}
      </div>

      {/* <div id='partners' className="mt-12 w-full max-w-6xl px-4 hidden md:block">
            <h2 className={`text-2xl font-bold mb-6 text-center ${isDarkMode ? 'text-white' : 'text-black'}`}>Our Partners</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {partnerLogos.map((partner, index) => (
                <a key={index} href={partner.url} target="_blank" rel="noopener noreferrer" className="block">
                  <img 
                    src={partner.img} 
                    alt={`Partner ${index + 1}`} 
                    className="w-full h-auto rounded-lg transform transition-all duration-300 hover:scale-110 animate-pop"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  />
                </a>
              ))}
            </div>
          </div> */}
      
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDarkMode ? "dark" : "light"}
      />
    </div>
    
  );
}