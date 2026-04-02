export interface AssetMetadata {
    symbol: string;
    name: string;
    logo_url: string;
    network?: string;
}

export const ASSET_METADATA: Record<string, AssetMetadata> = {
    'BTC': {
        symbol: 'BTC',
        name: 'Bitcoin',
        logo_url: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
        network: 'Bitcoin'
    },
    'ETH': {
        symbol: 'ETH',
        name: 'Ethereum',
        logo_url: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        network: 'ERC-20'
    },
    'USDT': {
        symbol: 'USDT',
        name: 'Tether',
        logo_url: 'https://assets.coingecko.com/coins/images/325/large/tether.png',
        network: 'TRC-20'
    },
    'USDC': {
        symbol: 'USDC',
        name: 'USD Coin',
        logo_url: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
        network: 'ERC-20'
    },
    'BNB': {
        symbol: 'BNB',
        name: 'BNB',
        logo_url: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
        network: 'BEP-20'
    },
    'SOL': {
        symbol: 'SOL',
        name: 'Solana',
        logo_url: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
        network: 'Solana'
    },
    'XRP': {
        symbol: 'XRP',
        name: 'XRP',
        logo_url: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
        network: 'Ripple'
    }
};

export function getAssetMetadata(symbol: string): AssetMetadata {
    const s = symbol.toUpperCase();
    return ASSET_METADATA[s] || {
        symbol: s,
        name: s,
        logo_url: `https://coinicons-api.vercel.app/api/icon/${s.toLowerCase()}`,
    };
}

export function getAssetLogo(symbol: string): string {
    return getAssetMetadata(symbol).logo_url;
}
