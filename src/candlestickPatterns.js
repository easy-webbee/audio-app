	// --- Candlestick Pattern Detection Helpers ---
    export function isDoji(d) {
        // const body = Math.abs(d.close - d.open);
        // const range = d.high - d.low;
        // return body / range < 0.1; // very small body relative to range
        return d.close === d.open
    }
    
    export function isHammer(d) {
        const body = Math.abs(d.close - d.open);
        const upperShadow = d.high - Math.max(d.close, d.open);
        const lowerShadow = Math.min(d.close, d.open) - d.low;
        return (lowerShadow > 2 * body) && (upperShadow < body);
    }
    
    export function isHangingMan(d) {
        const body = Math.abs(d.close - d.open);
        const upperShadow = d.high - Math.max(d.close, d.open);
        const lowerShadow = Math.min(d.close, d.open) - d.low;
        return (lowerShadow > 2 * body) && (upperShadow <= body) && (d.close < d.open);
    }
    
    export function isBullishEngulfing(prev, now) {
        return (
            prev.close < prev.open && // previous candle red
            now.close > now.open &&   // current candle green
            now.open < prev.close &&
            now.close > prev.open
        );
    }

            // Bearish Engulfing
    export function isBearishEngulfing(prev, now) {
        return (
            prev.close > prev.open &&  // prev green
            now.close < now.open &&    // now red
            now.open > prev.close &&
            now.close < prev.open
        );
    }

    // Dark Cloud Cover
    export function isDarkCloud(prev, now) {
        const midpoint = (prev.open + prev.close) / 2;
        return (
            prev.close > prev.open &&  // prev green
            now.open > prev.high &&    // gap up
            now.close < midpoint &&    // closes below midpoint
            now.close > prev.open      // but above prev open
        );
    }

    // Bullish Piercing
    export function isBullishPiercing(prev, now) {
        const midpoint = (prev.open + prev.close) / 2;
        return (
            prev.close < prev.open &&  // prev red
            now.open < prev.low &&     // gap down
            now.close > midpoint &&    // closes above midpoint
            now.close < prev.open      // but below prev open
        );
    }

    // Harami (bearish or bullish depending on colors)
    export function isHarami(prev, now) {
        return (
            (prev.close > prev.open && now.close < now.open && 
                now.open < prev.close && now.close > prev.open) || // bearish
            (prev.close < prev.open && now.close > now.open && 
                now.open > prev.close && now.close < prev.open)    // bullish
        );
    }

    // Harami Cross (small doji inside prior candle)
    export function isHaramiCross(prev, now) {
        const body = Math.abs(now.close - now.open);
        return (
            body / (now.high - now.low) < 0.1 &&
            now.high < Math.max(prev.open, prev.close) &&
            now.low > Math.min(prev.open, prev.close)
        );
    }

    // Morning Star (3-candle bullish reversal)
    export function isMorningStar(a, b, c) {
        return (
            a.close < a.open &&              // red
            Math.abs(b.close - b.open) < (a.open - a.close) * 0.3 && // small candle
            c.close > c.open &&              // green
            c.close > (a.open + a.close) / 2 // closes well into body of first
        );
    }

    // Evening Star (3-candle bearish reversal)
    export function isEveningStar(a, b, c) {
        return (
            a.close > a.open &&              // green
            Math.abs(b.close - b.open) < (a.close - a.open) * 0.3 && // small candle
            c.close < c.open &&              // red
            c.close < (a.open + a.close) / 2 // closes well into body of first
        );
    }

    // Morning Doji Star (doji middle candle)
    export  function isMorningDojiStar(a, b, c) {
        return isMorningStar(a, b, c) && isDoji(b);
    }

    // Evening Doji Star (doji middle candle)
    export   function isEveningDojiStar(a, b, c) {
        return isEveningStar(a, b, c) && isDoji(b);
    }