import React from 'react';
import { render } from 'react-dom';
import Chart from './Chart';
import { getData } from "./utils";
import { TypeChooser } from "react-stockcharts/lib/helper";

class ChartComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: null,
		};
		this.intervalId = null;
	}

	componentDidMount() {
		// fetch stock data dynamically from browser URL params
		this.fetchData();

		// refresh every 30s
		this.intervalId = setInterval(this.fetchData, 60000);
	}

	componentWillUnmount() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
		}
	}

	fetchData = () => {
		getData().then(data => {
			if (data && data.length >1) {
				this.setState({ data });
			}
		});
	};

	render() {
		if (!this.state.data) {
			return <div>Loading...</div>;
		}
		return (
			<TypeChooser>
				{type => <Chart type={type} data={this.state.data} />}
			</TypeChooser>
		);
	}
}

render(
	<ChartComponent />,
	document.getElementById("root")
);
