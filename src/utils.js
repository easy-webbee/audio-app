function getParamsFromUrl() {
  const params = new URLSearchParams(window.location.search);

  return {
    stockTicker: params.get("stockTicker") || "",
    endpoint: params.get("endpoint") || "po",
    timefame: params.get("timefame") || "1day",
  };
}

export async function getData() {
  try {
    // start, end 
    const { stockTicker, endpoint, timefame } = getParamsFromUrl();

    if (!stockTicker) {
      console.warn("⚠️ No stockTicker provided");
      return null;
    }
    const url = `http://localhost:3000/stock/local/${endpoint}?ticker=${stockTicker}&timefame=${timefame}`
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    const cleanData = data.filter(item => item !== null);
    return cleanData
      .map((item) => ({
        ...item,
        date: new Date(item.date),
      }))
      .reverse();
  } catch (error) {
    // console.error("Error fetching stock data:", error);
    return null;
  }
}

// 🔹 Add UI controls dynamically into DOM (above chart)
window.addEventListener("DOMContentLoaded", () => {
  const container = document.createElement("div");
  container.style.marginBottom = "1rem";

  const params = getParamsFromUrl();

  // 🔹 Input box
  const input = document.createElement("input");
  input.type = "text";
  input.id = "ipt_search";
  input.placeholder = "Enter stock ticker (e.g., TSLA)";
  input.style.padding = "5px";
  input.style.marginRight = "5px";
  if (params.stockTicker) input.value = params.stockTicker;

  // 🔹 Search button
  const button = document.createElement("button");
  button.textContent = "Search";
  button.id = "btn_search";
  button.style.marginRight = "5px";

  // div
  const div_endpoint = document.createElement("div");
  div_endpoint.textContent = `${params.endpoint}, ${params.timefame}`;
  div_endpoint.id = "div_endpoint";
  div_endpoint.style.marginRight = "5px";

  // 🔹 Endpoint select
  const endpointSelect = document.createElement("select");
  endpointSelect.id = "sel_endpoint";
  endpointSelect.style.padding = "5px";
  endpointSelect.style.marginRight = "5px";
  ["po", "fm"].forEach(ep => {
    const option = document.createElement("option");
    option.value = ep;
    option.textContent = ep;
    if (params.endpoint === ep) option.selected = true;
    endpointSelect.appendChild(option);
  });

  // 🔹 Timeframe select
  const timeframeSelect = document.createElement("select");
  timeframeSelect.id = "sel_timeframe";
  timeframeSelect.style.padding = "5px";
  timeframeSelect.style.marginRight = "5px";
  ["7day","1day", "4hour", "1hour", "30min", "15min","5min", "1min"].forEach(tf => {
    const option = document.createElement("option");
    option.value = tf;
    option.textContent = tf;
    if (params.timefame === tf) option.selected = true;
    timeframeSelect.appendChild(option);
  });

  // 🔹 Stock symbols select
  const select = document.createElement("select");
  select.id = "sel_symbols";
  select.style.padding = "5px";
  const symbols = ["TALK","RES","NVX","HLX","CPB","ATNI","ACHC","DNB","DTE","EQT","NI","LNT","CMS","PPL","DRIO","CRGY","FANG","AEE","TPL","NVX"];
  symbols.forEach(sym => {
    const option = document.createElement("option");
    option.value = sym;
    option.textContent = sym;
    if (params.stockTicker === sym) option.selected = true;
    select.appendChild(option);
  });

  // 🔹 Price log link
  const link = document.createElement("a");
  link.id = "lnk_price_log";
  link.textContent = "Go to Price Log";
  link.target = "_blank";
  link.style.marginLeft = "10px";
  if (params.stockTicker) link.href = `http://localhost:4200/price-log/${params.stockTicker}`;

  // 🔹 Update function
  const updateParams = () => {
    const ticker = input.value.trim();
    const endpoint = endpointSelect.value;
    const timeframe = timeframeSelect.value;
    if (!ticker) return;

    const searchParams = new URLSearchParams();
    searchParams.set("stockTicker", ticker);
    searchParams.set("endpoint", endpoint);
    searchParams.set("timefame", timeframe);

    window.history.replaceState({}, "", `${window.location.pathname}?${searchParams.toString()}`);
    link.href = `http://localhost:4200/price-log/${ticker}`;

    // Reload chart/data
    window.location.reload();
  };

  // 🔹 Event listeners
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") updateParams(); });
  button.addEventListener("click", updateParams);
  select.addEventListener("change", () => { input.value = select.value; updateParams(); });
  endpointSelect.addEventListener("change", updateParams);
  timeframeSelect.addEventListener("change", updateParams);

  // 🔹 Append to container
  container.appendChild(input);
  container.appendChild(button);
  container.appendChild(select);
  container.appendChild(endpointSelect);
  container.appendChild(timeframeSelect);
  container.appendChild(link);
  container.appendChild(div_endpoint);
  // Insert above chart root
  const root = document.getElementById("root");
  root.parentNode.insertBefore(container, root);
});

