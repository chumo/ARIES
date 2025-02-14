const experiments = _.keys(localStorage);
const storage = new LocalStorageManager();

d3.select('#experiments .dropdown-menu')
  .selectAll()
  .data(experiments)
  .join("li")
  .append("a")
  .attr("class", "dropdown-item")
  .attr("id", d => d)
  .attr("onclick", d => `displayExperiment("${d}")`)
  .text(d => d)

//-----------------------------------------------------------------------------
function displayExperiment(experiment) {
    d3.select("#dropdownExperiments").text(experiment);

    let project = storage.getItem(experiment);

    let title = `<i>experiment:</i> <b>${experiment}</b>, <i>created at:</i> <b>${project.createdAt}</b>`
    let X = [_.pluck(project.data, "ts")];

    let metrics = ['temperature_[°C]', 'pressure_[hPa]', 'relative_humidity_[%]'];
    for (let i in metrics) {
        Plotly.restyle("myDashboard", {"x": X}, [i]);
        Plotly.restyle("myDashboard", {"y": [_.pluck(project.data, metrics[i])]}, [i]);
    }

    for (let i = 0; i < 5; i +=1) {
        Plotly.restyle("myDashboard", {"x": X}, [i + 3]);
        Plotly.restyle("myDashboard", {"y": [_.pluck(project.data, `weight${i + 1}_[g]`)]}, [i + 3]);
    }

    // update title
    Plotly.relayout("myDashboard", "title", title);
}

//-----------------------------------------------------------------------------
function refreshDashboard() {
    let experiment = d3.select("#dropdownExperiments").text();
    if (experiment != "Select experiment") {
        displayExperiment(experiment);
    }
}