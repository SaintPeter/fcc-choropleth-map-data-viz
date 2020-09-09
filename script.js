// Data URL
//let geoUrl = 'counties.json'
let geoUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'

//let eduUrl = 'for_user_education.json'
let eduUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json'

let eduData;
let geoData;

// Fetch Data
Promise.all([
  d3.json(eduUrl),
  d3.json(geoUrl)
])
  .then(([edu, geo]) => {
    eduData = edu;
    geoData = geo;
    processData();
  })
  .catch((err) => {
    console.warn("Error fetching Data:", err)
  })

function processData(dataset) {
  const countyData = eduData.reduce((prev, county) => {
    prev[county.fips] = {
      area_name: county.area_name,
      edu: county.bachelorsOrHigher,
      state: county.state
    }
    return prev;
  }, {})

  let margin = {
    left: 100,
    right: 50,
    top: 100,
    bottom: 100
  }

  let w = parseInt(d3.select('svg').style('width')) - margin.left - margin.right;
  let h = parseInt(d3.select('svg').style('height')) - margin.top - margin.bottom;

  let tooltip = d3.select(".container")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip")

  // Init SVG
  let svg = d3.select('body')
    .select('svg')
    .attr("width", w + margin.left + margin.right)
    .attr("height",  h + margin.top + margin.bottom)
    .attr('viewBox', `0 0 ${w + margin.left + margin.right} ${h + margin.top + margin.bottom}`);

  let innerSvg = svg.append('svg')
    .attr("x", margin.left)
    .attr("y", margin.top)

  // Color Scale
  let eduRange = [
    d3.min(eduData, d => d.bachelorsOrHigher),
    d3.max(eduData, d => d.bachelorsOrHigher)
  ];

  let colorScale = d3.scaleLinear()
    .domain(eduRange)
    .range(['white', 'blue'])

  let path = d3.geoPath();

  // Primary Data Display
  innerSvg.append('g')
    .selectAll('path')
    .data(topojson
      .feature(geoData, geoData.objects.counties)
      .features
    )
    .enter()
    .append('path')
    .attr('class', 'county' )
    .attr('fill', d => colorScale(countyData[d.id].edu))
    .attr('data-fips', d => d.id)
    .attr('data-education', d => countyData[d.id].edu)
    .attr('d', path )
    .on('mouseover', function (e, d) {
        let county = countyData[d.id]
        let ttText = `${county.area_name}, ${county.state}: ${county.edu}%`

        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9)
        tooltip
          .html(ttText)
          .style("left", e.clientX  + "px")
          .style("top", e.clientY  + "px")
          .attr('data-education', countyData[d.id].edu )
      })
      .on('mouseout', function () {
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 0);
      })

  innerSvg.append('path')
    .datum(topojson
      .mesh(geoData, geoData.objects.states)
    )
    .attr('class', 'states')
    .attr('d', path)
    .attr('fill', 'none')
  
  // Chart Title
  svg.append('text')
    .text("US Education Level by County")
    .attr('id', 'title')
    .attr('class','title')
    .attr('x', w/2 + margin.left)
    .attr('y', margin.top / 2)

  // Chart Subtitle
  svg.append('text')
    .html(`Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)`)
    .attr('class', 'subtitle')
    .attr('x', w/ 2 + margin.left)
    .attr('y', margin.top - 20)
    .attr('id', 'description')

  // Legend
  let legend = d3.legendColor()
    .shapeWidth(60)
    .shapeHeight(10)
    .orient('horizontal')
    .scale(colorScale)

  let legGroup = innerSvg.append('g')
    .attr('class', 'legend')
    .attr('id', 'legend')
    .attr('transform', `translate(${ w * 1/2 + 50 },10)`)
    .call(legend)
}


