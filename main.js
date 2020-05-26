let width = document.body.clientWidth;
let height = width;
let padding = 32;

// TODO: compute cell sizes (task 1)
let cellWidth = 140;
let cellHeight = 50;

d3.csv("iris.csv", d3.autoType).then(function (data) {
    let attributes = data.columns.filter(d => d !== "species");
    let x = attributes.map(attribute =>
        d3
            .scaleLinear()
            .domain(d3.extent(data, item => item[attribute]))
            .range([0, cellWidth])
    )
    let y = x.map(x => x.copy().range([cellHeight, 0]));

    // TODO: setup color scale (task 2)
    let color = function (_) {
        return "#263238";
    }

    const svg = d3.select("#vis").append("svg").attr("viewBox", [0, 0, width, height]);

    // set the style of hidden data items
    svg.append("style").text("circle.hidden { fill: #000; fill-opacity: 0.1;}");

    // setup a group-element for each cell with the respective transform
    const cell = svg
        .append("g")
        .selectAll("g")
        .data(d3.cross(d3.range(attributes.length), d3.range(attributes.length)))
        .join("g")
        .attr(
            "transform",
            ([i, j]) =>
                `translate(${padding + i * (padding + cellWidth)},${padding +
                j * (padding + cellHeight)})`
        );

    // create rectangles showing the plot area of each cell
    cell
        .append("rect")
        .attr("fill", "#ECEFF1")
        .attr("stroke", "none")
        .attr("width", cellWidth)
        .attr("height", cellHeight);

    // the following function is called for each individual cell
    // i, j are the column- and row-index of this cell
    cell.each(function ([i, j]) {
        // TODO: draw the scatterplot for this cell here (task 3)

        // create an x-axis below each cell
        d3.select(this)
            .append("g")
            .attr("transform", `translate(0, ${cellHeight})`)
            .call(d3.axisBottom(x[i]).ticks(cellWidth / 50));

        // create a y-axis to the left of each cell
        d3.select(this)
            .append("g")
            .call(d3.axisLeft(y[j]).ticks(cellHeight / 30));
    });

    // set attributes of the circles
    const circle = cell
        .selectAll("circle")
        .attr("r", 4.5)
        .attr("fill-opacity", 0.5)
        .attr("fill", d => color(d.species));

    // setup a brush for each cell
    cell.call(brush, circle);

    // create a label for each attribute on the diagonal
    svg
        .append("g")
        .style("font", "18px Source Serif Pro")
        .style("pointer-events", "none")
        .selectAll("text")
        .data(attributes)
        .join("text")
        .attr(
            "transform",
            (d, i) =>
                `translate(${padding + i * (padding + cellWidth)},${padding +
                i * (padding + cellHeight)})`
        )
        .attr("x", 10)
        .attr("y", 10)
        .attr("dy", ".71em")
        .text(d => d);

    function brush(cell, circle) {
        const brush = d3
            .brush()
            .extent([[0, 0], [cellWidth, cellHeight]])
            .on("start", startBrushing)
            .on("brush", updateBrush)
            .on("end", stopBrushing);

        cell.call(brush);

        let brushCell;

        // clear any previous brush
        function startBrushing() {
            if (brushCell !== this) {
                d3.select(brushCell).call(brush.move, null);
                brushCell = this;
            }
        }

        // highlight circles in the brush selection
        function updateBrush([i, j]) {
            if (d3.event.selection === null) return;
            const [[x0, y0], [x1, y1]] = d3.event.selection;

            // TODO: implement the linking (task 4)
            circle.classed("hidden", d => {
                return false;
            });
        }

        // lift the selection if the brush is empty
        function stopBrushing() {
            if (d3.event.selection !== null) return;
            circle.classed("hidden", false);
        }
    }
});

