let graphDiv = $('#plotId')[0];
let layout = {
  xaxis: {
    title: 'time',
    showgrid: false,
    zeroline: false,
    uirevision: true,
  },
  yaxis: {
    title: 'value',
    showline: false,
    uirevision: true,
  },
  hovermode: 'x',
  showlegend: true,
  legend: {
    y: '0.9',
    yanchor: 'top',
  },
  margin: {
    t: 10,
    l: 50,
  },
};

///////////////////////////////////////////////////////////////////////////////
function initPlot() {
  // Create the plot for the first time (needed because the plot needs to be
  // created after the div element becomes visible)

  Plotly.newPlot(
    graphDiv,
    [],
    layout,
    config={displaylogo: false, responsive: true},
  );
}

///////////////////////////////////////////////////////////////////////////////
function plotPoints() {

    // Retrieve subset of points without the `ts` and the `raw` keys
    let sensors = _.without(_.uniq(_.flatten(_.map(points, _.keys))), 'ts', 'raw');

    // Update plot
    var data = [];
    sensors.forEach(key => {
      data.push({
        x: points.map(d => new Date(d.ts)),
        y: points.map(d => d[key]),
        type: 'scatter',
        mode: 'lines+markers',
        name: key,
      });
    });

    Plotly.react(
        graphDiv,
        data,
        layout,
        config={displaylogo: false, responsive: true},
    );

}

///////////////////////////////////////////////////////////////////////////////
function updatePlot() {
  let point = points.slice(-1)[0];
  let {ts, raw, ...sensors} = point;
  let traces = graphDiv.data.map(d => d.name);

  for (sensor in sensors){
    if (traces.includes(sensor)) {

      for (tix in traces){
        if (sensor === traces[tix]){
          Plotly.restyle(
            graphDiv,
            {
              x: [points.map(d => new Date(d.ts))],
              y: [points.map(d => d[sensor])]
            },
            tix
          );
        }
      }

    } else {
      plotPoints();
    }
  }
}