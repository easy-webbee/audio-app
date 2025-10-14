
import React from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { ChartCanvas, Chart } from "react-stockcharts";
import {
	CandlestickSeries,
	BarSeries,
	AreaSeries,
	LineSeries,
	MACDSeries,
	SARSeries,	
	RSISeries,
	BollingerSeries
} from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
	CrossHairCursor,
	EdgeIndicator,
	CurrentCoordinate,
	MouseCoordinateX,
	MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import {
	OHLCTooltip,SingleValueTooltip,	RSITooltip,
	MovingAverageTooltip,MACDTooltip,
} from "react-stockcharts/lib/tooltip";
import { ema, macd, sma, sar, rsi, bollingerBand } from "react-stockcharts/lib/indicator";
import { fitWidth } from "react-stockcharts/lib/helper";
import algo from "react-stockcharts/lib/algorithm";
import {
	Annotate,
	LabelAnnotation,
} from "react-stockcharts/lib/annotation";
import { last } from "react-stockcharts/lib/utils";

import {
    isDoji,
    isHammer,
    isHangingMan,
    isBullishEngulfing,
    isBearishEngulfing,
    isDarkCloud,
    isBullishPiercing,
    isHarami,
    isHaramiCross,
    isMorningStar,
    isEveningStar,
    isMorningDojiStar,
    isEveningDojiStar
} from "./candlestickPatterns";


const macdAppearance = {
	stroke: {
		macd: "#FF0000",
		signal: "#00F300",
	},
	fill: {
		divergence: "#4682B4"
	},
};

const bbStroke = {
	top: "#964B00",
	middle: "#000000",
	bottom: "#964B00",
};

const bbFill = "#d1d9e0";


const mouseEdgeAppearance = {
	textFill: "#542605",
	stroke: "#05233B",
	strokeOpacity: 1,
	strokeWidth: 3,
	arrowWidth: 5,
	fill: "#BCDEFA",
};

class MovingAverageCrossOverAlgorithmV1 extends React.Component {
	render() {
		const { type, data: initialData, width, ratio } = this.props;
		const ema5 = ema().id(5).options({ windowSize: 5 }).merge((d, c) => { d.ema5 = c; }).accessor(d => d.ema5);
		const ema20 = ema().id(20).options({ windowSize:20 }).merge((d, c) => { d.ema20 = c; }).accessor(d => d.ema20);
		const ema50 = ema().id(50).options({ windowSize:50 }).merge((d, c) => { d.ema50 = c; }).accessor(d => d.ema50).stroke("black");
		const ema100 = ema().id(100).options({ windowSize:100 }).merge((d, c) => { d.ema100 = c; }).accessor(d => d.ema100).stroke("brown");
		const ema200 = ema().id(200).options({ windowSize:200 }).merge((d, c) => { d.ema200 = c; }).accessor(d => d.ema200).stroke("purple");
		const buySell5_20 = algo()
			.windowSize(2)
			.accumulator(([prev, now]) => {
				const { ema5: prevShortTerm, ema20: prevLongTerm } = prev;
				const { ema5: nowShortTerm, ema20: nowLongTerm } = now;
				if (prevShortTerm < prevLongTerm && nowShortTerm > nowLongTerm) return "LONG5_20";
				if (prevShortTerm > prevLongTerm && nowShortTerm < nowLongTerm) return "SHORT5_20";
			})
			.merge((d, c) => { d.longShort5_20 = c; });
		
		const buySell5_200 = algo()
			.windowSize(2)
			.accumulator(([prev, now]) => {
				const { ema5: prevShortTerm, ema200: prevLongTerm } = prev;
				const { ema5: nowShortTerm, ema200: nowLongTerm } = now;
				if (prevShortTerm < prevLongTerm && nowShortTerm > nowLongTerm) return "LONG5_200";
				if (prevShortTerm > prevLongTerm && nowShortTerm < nowLongTerm) return "SHORT5_200";
			})
			.merge((d, c) => { d.longShort5_200 = c; });
		
		const ema26 = ema().id(26).options({ windowSize: 26 }).merge((d, c) => { d.ema26 = c; }).accessor(d => d.ema26);
		const ema12 = ema().id(12).options({ windowSize: 12 }).merge((d, c) => {d.ema12 = c;}).accessor(d => d.ema12);
		const macdCalculator = macd().options({fast: 12,slow: 26,signal: 9,}).merge((d, c) => {d.macd = c;}).accessor(d => d.macd);

		const smaVolume50 = sma().id(3).options({windowSize: 50,sourcePath: "volume",}).merge((d, c) => {d.smaVolume50 = c;}).accessor(d => d.smaVolume50);

		// Default annotation base
		const defaultAnnotationProps = {
			fontFamily: "Glyphicons Halflings",
			fontSize: 10,
			opacity: 0.8,
			onClick: console.log.bind(console),
		};
		
		// Helper function to generate annotation props
		const createAnnotationProps = ({ type = "LONG", label, color, offset = 20 }) => ({
			...defaultAnnotationProps,
			fill: color || (type === "LONG" ? "#008000" : "#d40d1d"),
			text: `${type === "LONG" ? "BUY" : "SELL"}(${label})`,
			y: ({ yScale, datum }) => {
				if (type === "LONG") {
				  // place WAY above the candle
				  return yScale(datum.high) - offset;
				} else {
				  // place WAY below the candle
				  return yScale(datum.low) + offset;
				}
			  },
			tooltip: type === "LONG" ? "Go long" : "Go short",
		});
		// ready to action
		const long5_20Annotation = createAnnotationProps({ type: "LONG", label: "5/20" });
		const short5_20Annotation = createAnnotationProps({ type: "SHORT", label: "5/20" });
		// confine action
		const long5_200Annotation = createAnnotationProps({ type: "LONG", label: "5/200" , offset: 50 });
		const short5_200Annotation = createAnnotationProps({ type: "SHORT", label: "5/200" , offset: 50 });
		//sar
		const accelerationFactor = .02;
		const maxAccelerationFactor = .2;
		const defaultSar = sar().options({accelerationFactor, maxAccelerationFactor}).merge((d, c) => {d.sar = c;}).accessor(d => d.sar);
		// rsi
		const rsiCalculator = rsi().options({ windowSize: 14 }).merge((d, c) => {d.rsi = c;}).accessor(d => d.rsi);

		const bb = bollingerBand()
			.merge((d, c) => {d.bb = c;})
			.accessor(d => d.bb);

		const indicators = [ema5,ema12, ema20,ema26,macdCalculator,ema50, ema100, ema200, buySell5_20, buySell5_200, defaultSar, rsiCalculator, bb];
		// Apply all indicators to initialData
		const calculatedData = indicators.reduce(
			(data, indicator) => indicator(data),
			initialData
		);
		


		calculatedData.forEach((d, i, arr) => {
			if (i === 0) return;
		
			const prev = arr[i - 1];
			const prev2 = arr[i - 2];
		
			// --- Single-candle patterns ---
			if (isDoji(d)) d.pattern = "DOJI";
			else if (isHammer(d)) d.pattern = "HAMMER";
			else if (isHangingMan(d)) d.pattern = "HANGING_MAN";
		
			// --- Two-candle patterns ---
			else if (isBullishEngulfing(prev, d)) d.pattern = "BULL_ENGULF";
			else if (isBearishEngulfing(prev, d)) d.pattern = "BEAR_ENGULF";
			else if (isDarkCloud(prev, d)) d.pattern = "DARK_CLOUD";
			else if (isBullishPiercing(prev, d)) d.pattern = "BULL_PIERCE";
			else if (isHarami(prev, d)) d.pattern = "HARAMI";
			else if (isHaramiCross(prev, d)) d.pattern = "HARAMI_CROSS";
		
			// --- Three-candle patterns ---
			else if (i > 1 && isMorningStar(prev2, prev, d)) d.pattern = "MORNING_STAR";
			else if (i > 1 && isEveningStar(prev2, prev, d)) d.pattern = "EVENING_STAR";
			else if (i > 1 && isMorningDojiStar(prev2, prev, d)) d.pattern = "MORNING_DOJI_STAR";
			else if (i > 1 && isEveningDojiStar(prev2, prev, d)) d.pattern = "EVENING_DOJI_STAR";
		});
		// ✅ Get latest MACD
		const latest = calculatedData[calculatedData.length - 1];
		const last1days = calculatedData[calculatedData.length - 2];
		const last2days = calculatedData[calculatedData.length - 3];

		let macdCheck = "";
		let macdNegative = "";
		let macd2dayago
		let divergenceCheck
		let rsiDirection
		if(last1days){
			rsiDirection = last1days.rsi >= latest.rsi? "DOWN": `UP`;
		}
		if(last2days && latest.macd){
			macd2dayago = last2days.macd.macd >= last2days.macd.signal? "✅ MACD 2 DAY AGO": `❌ MACD 2 DAY AGO`;
			divergenceCheck = last2days.macd.divergence <=0 && latest.macd.divergence>=0? "✅ divergence bull": `❌ divergence bear`;
		}
		if (latest && latest.macd) {
			macdCheck = latest.macd.macd >= latest.macd.signal ? "✅ MACD BUY ZONE" : `❌ MACD SELL ZONE`;
			macdNegative = latest.macd.macd
		}
		let buySell5_20Check = "";
		if (latest && latest.longShort5_20) {
			buySell5_20Check = (latest.longShort5_20 === "LONG5_20")? "✅ 5_20 BUY ZONE":latest.longShort5_20 === "SHORT5_20"? `❌ 5_20 SELL ZONE`:'123';
		}
		let sarCheck = ''
		if(latest && latest.sar){
			sarCheck = latest.sar < latest.close ? "✅ SAR BUY ZONE":"❌ SAR SELL ZONE"
		}
		let close2ema200 = 'close: '
		let close2emaPercent = 0
		if(latest && latest.ema200){
			close2ema200 = latest.close > latest.ema200 ?"✅ BULLISH EMA200 ":"❌ BEARISH EMA200"
			close2emaPercent = (latest.close-latest.ema200)/latest.close
		}
		const dojiAnnotation = createAnnotationProps({ type: "LONG", label: "DOJI-REVERS", color:'#0a0000', offset: 30 });
		const hammerAnnotation = createAnnotationProps({ type: "LONG", label: "HAMMER",  offset: 40 });
		const hangingManAnnotation = createAnnotationProps({ type: "SHORT", label: "HANG_MAN",  offset: 40 });
		const bullEngulfAnnotation = createAnnotationProps({ type: "LONG", label: "BULL_ENG", offset: 50 });
		
		const bearEngulfAnnotation = createAnnotationProps({ type: "SHORT", label: "BEAR_ENG", offset: 60 });
		const darkCloudAnnotation = createAnnotationProps({ type: "SHORT", label: "DARK_CLOUD", offset: 60 });
		const bullPierceAnnotation = createAnnotationProps({ type: "LONG", label: "PIERCE",  offset: 60 });
		const haramiAnnotation = createAnnotationProps({ type: "LONG", label: "HARAMI",  offset: 60 });
		const haramiCrossAnnotation = createAnnotationProps({ type: "LONG", label: "HARAMI_X",  offset: 70 });
		const morningStarAnnotation = createAnnotationProps({ type: "LONG", label: "MORNING*",  offset: 70 });
		const eveningStarAnnotation = createAnnotationProps({ type: "SHORT", label: "EVENING*",  offset: 70 });
		const morningDojiStarAnnotation = createAnnotationProps({ type: "LONG", label: "M_DOJI*", offset: 80 });
		const eveningDojiStarAnnotation = createAnnotationProps({ type: "SHORT", label: "E_DOJI*",  offset: 80 });


		const xScaleProvider = discontinuousTimeScaleProvider
			.inputDateAccessor(d => d.date);
		const {
			data,
			xScale,
			xAccessor,
			displayXAccessor,
		} = xScaleProvider(calculatedData);

		const start = xAccessor(last(data));
		const end = xAccessor(data[Math.max(0, data.length - 150)]);
		const xExtents = [start, end];
		const getRsiColor = (rsi) => {
			if (rsi > 69) return "#DC3545";   // overbought - red
			if (rsi < 30) return "#28A745";   // oversold - green
			return "#FFA500";                 // neutral - orange
		  };
		return (
			<div>
			{/* ✅ MACD check displayed above chart */}
			<div id="Signal">
			<h3 style={{     fontFamily: "monospace",
				fontSize: "19px",
				lineHeight: "1.4",
				margin: "8px 0", }}>
				<span style={{ fontWeight: "bold", color: "#3FA7D6" }}>
					RSI:
				</span>{" "}  
				{rsiDirection==='UP'?<span style={{ fontWeight: "bold", color: "#28A745" }} id="rsiDirection">{rsiDirection}</span>
								:<span style={{ fontWeight: "bold", color: "#DC3545" }} id="rsiDirection">{rsiDirection}</span>} {" "} 
				<span id="closeRSI" style={{color: getRsiColor(latest.rsi),}}>{latest.rsi}</span>
				{"  |  "}
				<span style={{ fontWeight: "bold", color: "#FFA500" }}>Close:</span>{" "}
				<span id="closePrice">{latest.close}</span>

				{"  |  "}
				<span style={{ fontWeight: "bold", color: "#28A745" }}>High:</span>{" "}
				<span id="highPrice">{latest.high}</span>

				{"  |  "}
				<span style={{ fontWeight: "bold", color: "#DC3545" }}>Low:</span>{" "}
				<span id="lowPrice">{latest.low}</span>

				<br />

				<span style={{ fontWeight: "bold", color: "#6F42C1" }}>
					[MA 20]:
				</span>{" "}
				<span
					id="above_20"
					style={{
					color: latest.low > latest.ema20 ? "#28A745" : "#DC3545",
					fontWeight: "bold",
					}}
				>
					{latest.low > latest.ema20 ? "Bull" : "Bear"}
				</span>{" "}
				<span>
					{" "}
					low: {latest.low} | ema20: {latest.ema20}
				</span>

				{"  |  "}

				<span style={{ fontWeight: "bold", color: "#6F42C1" }}>
					[MA 50]:
				</span>{" "}
				<span
					id="above_50"
					style={{
					color: latest.low > latest.ema50 ? "#28A745" : "#DC3545",
					fontWeight: "bold",
					}}
				>
					{latest.low > latest.ema50 ? "Bull" : "Bear"}
				</span>{" "}
				<span>
					{" "}
					low: {latest.low} | ema50: {latest.ema50}
				</span>
				</h3>

				<h4> Last Data on date: 
					<span id="lastDataOn">{new Date(latest.date).toLocaleDateString()}</span>
				</h4>
				<div id="oscillator">
					<span id="macdSignal" style={{ margin: "10px 0", fontWeight: "bold" }}>{macdCheck} | {macd2dayago}</span>
					<span> divergence: {divergenceCheck}
					</span>
					<span id="macdNegative">{macdNegative}</span>
					<span id="5_20Signal" style={{ margin: "10px 0", fontWeight: "bold" }}>
					{buySell5_20Check}
					</span>
					<span id="sarCheck" style={{ margin: "10px 0", fontWeight: "bold" }}>
						{sarCheck}
					</span>
					<span id="close2ema200">{close2ema200}</span>
					<span>
						{latest.ema200 && (
							<span>ema200: {latest.ema200} <span id="percentDiff">{(close2emaPercent * 100)}</span> %</span>
						)}
				</span>

				</div>				
			</div>
			<ChartCanvas height={850}
				width={width}
				ratio={ratio}
				margin={{ left: 70, right: 70, top: 20, bottom: 30 }}
				type={type}
				seriesName="MSFT"
				data={data}
				xScale={xScale}
				xAccessor={xAccessor}
				displayXAccessor={displayXAccessor}
				xExtents={xExtents}
			>
				<Chart id={1} height={400}
					yExtents={[d => [d.high, d.low,  d.sar], ema5.accessor(), ema20.accessor(),ema50.accessor(),ema100.accessor(), ema200.accessor(), bb.accessor()]}
					padding={{ top: 10, bottom: 20 }}
				>
					{/* <XAxis axisAt="bottom" orient="bottom"/> */}
{/* 
					<Label x={(width - margin.left - margin.right) / 2} y={height - 45}
						fontSize="12" text="XAxis Label here" /> */}

					<YAxis axisAt="right" orient="right" ticks={5} />

					{/* <Label x={yAxisLabelX} y={yAxisLabelY}
						rotate={-90}
						fontSize="12" text="YAxis Label here" /> */}
					<MouseCoordinateX
						at="bottom"
						orient="bottom"
						displayFormat={timeFormat("%Y-%m-%d")} />
					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<CandlestickSeries />
					<BollingerSeries yAccessor={d => d.bb}
						stroke={bbStroke}
						fill={bbFill} />
					<EdgeIndicator itemType="last" orient="right" edgeAt="right"
						yAccessor={d => d.close} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"}/>

					<SARSeries yAccessor={d => d.sar}/>


					<LineSeries yAccessor={ema5.accessor()} stroke={ema5.stroke()}/>
					<LineSeries yAccessor={ema20.accessor()} stroke={ema20.stroke()}/>
					<LineSeries yAccessor={ema200.accessor()} stroke={ema200.stroke()}/>
					<LineSeries yAccessor={ema50.accessor()} stroke={ema50.stroke()}/>
					<LineSeries yAccessor={ema100.accessor()} stroke={ema100.stroke()}/>

					<CurrentCoordinate yAccessor={ema5.accessor()} fill={ema5.stroke()} />
					<CurrentCoordinate yAccessor={ema20.accessor()} fill={ema20.stroke()} />
					<CurrentCoordinate yAccessor={ema200.accessor()} fill={ema200.stroke()} />
					<CurrentCoordinate yAccessor={ema50.accessor()} fill={ema50.stroke()} />
					<CurrentCoordinate yAccessor={ema100.accessor()} fill={ema100.stroke()} />
					<EdgeIndicator itemType="last" orient="right" edgeAt="right"
						yAccessor={d => d.close} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"}/>

					<OHLCTooltip origin={[-40, 0]}/>
					<MovingAverageTooltip
						onClick={e => console.log(e)}
						origin={[-38, 15]}
						options={[
							{
								yAccessor: ema5.accessor(),
								type: "EMA",
								stroke: ema5.stroke(),
								windowSize: ema5.options().windowSize,
							},
							{
								yAccessor: ema20.accessor(),
								type: "EMA",
								stroke: ema20.stroke(),
								windowSize: ema20.options().windowSize,
							},
							{
								yAccessor: ema200.accessor(),
								type: "EMA",
								stroke: ema200.stroke(),
								windowSize: ema200.options().windowSize,
							},
							{
								yAccessor: ema50.accessor(),
								type: "EMA",
								stroke: ema50.stroke(),
								windowSize: ema50.options().windowSize,
							},							{
								yAccessor: ema100.accessor(),
								type: "EMA",
								stroke: ema100.stroke(),
								windowSize: ema100.options().windowSize,
							},
						]}
					/>
					{/* for sar display */}
					<SingleValueTooltip
						yLabel={`SAR (${accelerationFactor}, ${maxAccelerationFactor})`}
						yAccessor={d => d.sar}
						origin={[300, 30]}/>
					<Annotate with={LabelAnnotation} when={d => d.longShort5_20 === "LONG5_20"}
						usingProps={long5_20Annotation} />
					<Annotate with={LabelAnnotation} when={d => d.longShort5_20 === "SHORT5_20"}
						usingProps={short5_20Annotation} />
					
					<Annotate with={LabelAnnotation} when={d => d.longShort5_200 === "LONG5_200"}
						usingProps={long5_200Annotation} />
					<Annotate with={LabelAnnotation} when={d => d.longShort5_200 === "SHORT5_200"}
						usingProps={short5_200Annotation} />

					<Annotate with={LabelAnnotation} when={d => d.pattern === "DOJI"} usingProps={dojiAnnotation} />
					<Annotate with={LabelAnnotation} when={d => d.pattern === "HAMMER"} usingProps={hammerAnnotation} />
					<Annotate with={LabelAnnotation} when={d => d.pattern === "HANGING_MAN"} usingProps={hangingManAnnotation} />
					<Annotate with={LabelAnnotation} when={d => d.pattern === "BULL_ENGULF"} usingProps={bullEngulfAnnotation} />

					<Annotate with={LabelAnnotation} when={d => d.pattern === "BEAR_ENGULF"} usingProps={bearEngulfAnnotation} />
					<Annotate with={LabelAnnotation} when={d => d.pattern === "DARK_CLOUD"} usingProps={darkCloudAnnotation} />
					<Annotate with={LabelAnnotation} when={d => d.pattern === "BULL_PIERCE"} usingProps={bullPierceAnnotation} />
					<Annotate with={LabelAnnotation} when={d => d.pattern === "HARAMI"} usingProps={haramiAnnotation} />
					<Annotate with={LabelAnnotation} when={d => d.pattern === "HARAMI_CROSS"} usingProps={haramiCrossAnnotation} />
					<Annotate with={LabelAnnotation} when={d => d.pattern === "MORNING_STAR"} usingProps={morningStarAnnotation} />
					<Annotate with={LabelAnnotation} when={d => d.pattern === "EVENING_STAR"} usingProps={eveningStarAnnotation} />
					<Annotate with={LabelAnnotation} when={d => d.pattern === "MORNING_DOJI_STAR"} usingProps={morningDojiStarAnnotation} />
					<Annotate with={LabelAnnotation} when={d => d.pattern === "EVENING_DOJI_STAR"} usingProps={eveningDojiStarAnnotation} />

				</Chart>



				<Chart id={2} height={200}
					yExtents={[d => d.volume, smaVolume50.accessor()]}
					origin={(w, h) => [0, h - 520]}
				>
					<YAxis axisAt="left" orient="left" ticks={5} tickFormat={format(".2s")}/>

					<MouseCoordinateY
						at="left"
						orient="left"
						displayFormat={format(".4s")}
						{...mouseEdgeAppearance}
					/>

					<BarSeries yAccessor={d => d.volume} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"} />
					<AreaSeries yAccessor={smaVolume50.accessor()} stroke={smaVolume50.stroke()} fill={smaVolume50.fill()}/>
					<XAxis axisAt="bottom" orient="bottom"/>
				</Chart>
				<Chart id={3} height={150}
					yExtents={macdCalculator.accessor()}
					origin={(w, h) => [0, h - 300]} padding={{ top: 10, bottom: 10 }}
				>
					{/* <XAxis axisAt="bottom" orient="bottom"/> */}
					<XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} />
					<YAxis axisAt="right" orient="right" ticks={2} />

					<MouseCoordinateX
						at="bottom"
						orient="bottom"
						displayFormat={timeFormat("%Y-%m-%d")}
						rectRadius={5}
						{...mouseEdgeAppearance}
					/>
					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")}
						{...mouseEdgeAppearance}
					/>

					<MACDSeries yAccessor={d => d.macd}
						{...macdAppearance} />
					<MACDTooltip
						origin={[-38, 15]}
						yAccessor={d => d.macd}
						options={macdCalculator.options()}
						appearance={macdAppearance}
					/>
				</Chart>
	
				<Chart id={8}
					yExtents={[0, 100]}
					height={150} origin={(w, h) => [0, h - 150]}
				>
					<XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} />
					<YAxis axisAt="right"
						orient="right"
						tickValues={[30, 50, 70]}/>
					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<RSISeries yAccessor={d => d.rsi} />

					<RSITooltip origin={[-38, 15]}
						yAccessor={d => d.rsi}
						options={rsiCalculator.options()} />
				</Chart>
				<CrossHairCursor />
			</ChartCanvas>
			</div>
		);
	}
}

MovingAverageCrossOverAlgorithmV1.propTypes = {
	data: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

MovingAverageCrossOverAlgorithmV1.defaultProps = {
	type: "svg",
};

MovingAverageCrossOverAlgorithmV1 = fitWidth(MovingAverageCrossOverAlgorithmV1);

export default MovingAverageCrossOverAlgorithmV1;
