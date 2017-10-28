$(document).ready(function() {
    $.getJSON('https://raw.githubusercontent.com/hiebj/world-topo/master/world-topo-min.json',
        function(wordMapData) {
            $.getJSON('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json',
                function(meteoriteData) {


                    const c = document.getElementById("GLOBE"),

                        width = 960,
                        height = 600,
                        countries = topojson.feature(wordMapData, wordMapData.objects.countries).features,
                        borders = topojson.mesh(wordMapData, wordMapData.objects.countries, (a, b) => a !== b),
                        graticule = d3.geoGraticule();


                    let radius = d3.scalePow().exponent(0.4).range([1, 20]).domain(d3.extent(meteoriteData.features, d => d.properties.mass == null ? 0.1 : Number(d.properties.mass)));

                    _projection = d3.geoMercator()
                        .translate([(width / 2), (height / 2)])
                        .scale(width / 2 / Math.PI);

                    path = d3.geoPath().projection(_projection);

                    globe = d3.select("#GLOBE")
                        .append("svg")
                        .attr("width", width)
                        .attr("height", height)
                        .append("g");


                    worldMap = globe.append("g");


                    globe.append("path")
                        .datum(graticule)
                        .attr("class", "graticule")
                        .attr("d", path);


                    worldMap.append("path")
                        .datum({
                            type: "LineString",
                            coordinates: [
                                [-180, 0],
                                [-90, 0],
                                [0, 0],
                                [90, 0],
                                [180, 0]
                            ]
                        })
                        .attr("class", "equator")
                        .attr("d", path);






                    worldMap.selectAll(".country")
                        .data(countries)
                        .enter()
                        .insert("path")
                        .attr("class", "country")
                        .attr("d", path)
                        .attr("id", function(d, i) {
                            return d.id;
                        })
                        .attr("title", function(d, i) {
                            return d.properties.name;
                        });


                    worldMap.append("path")
                        .datum(borders)
                        .attr("d", path)
                        .attr("class", "border");

                    worldMap.append("g")
                        .attr("class", "bubble")
                        .selectAll("circle")
                        .data(meteoriteData.features)
                        .enter().append("circle")
                        .attr("transform", function(d) {
                            return "translate(" + path.centroid(d) + ")";
                        })
                        .attr("r", d => radius(d.properties.mass))
                        .on("mouseover", d => {
                            d3.select("#Name").text(+d.properties["name"] == "null" ? "Not available" : ("Name: " + d.properties["name"]));
                            d3.select("#Mass").text(d.properties.mass == "null" ? "Not available" : ("Mass: " + d.properties.mass));
                            d3.select("#Class").text("Class: " + d.properties.recclass == "null" ? "Not available" : ("Class: " + d.properties.recclass));
                            d3.select("#DiscovaryDate").text(d.properties.year == "null" ? "Not available" : ("Discovary Date: " +  d3.timeFormat("%B %d, %Y")(new Date(d.properties.year))))
                            d3.select("#tooltip").style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
                        })
                        .on("mousemove", d => d3.select("#tooltip").attr("class", "visible"))

                    .on("mouseout", d => d3.select("#tooltip").attr("class", "invisible"));


                });

        });


});
