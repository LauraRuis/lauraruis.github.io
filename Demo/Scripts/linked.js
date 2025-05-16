window.onload = function() {

    /**
     * Initialize some global variables and make containers for all elements of the page.
     * Make titles for these elements of the page.
     */
    // initialize attributes of svg as constants
    const margins = {top: 20, right: 200, bottom: 50, left: 50},
        height = 393 - margins.top - margins.bottom,
        width = 800 - margins.left - margins.right;

    // array of filenames that contain the data
    const filenames = [
        "https://raw.githubusercontent.com/LauraRuis/lauraruis.github.io/refs/heads/master/Demo/Data/answer_and_slope_pretraining_data_prepared_35B.json",
        "https://raw.githubusercontent.com/LauraRuis/lauraruis.github.io/refs/heads/master/Demo/Data/answer_and_slope_pretraining_data_prepared_7B.json",
        "https://raw.githubusercontent.com/LauraRuis/lauraruis.github.io/refs/heads/master/Demo/Data/if_top_bottom_data_prepared_35B.json",
        "https://raw.githubusercontent.com/LauraRuis/lauraruis.github.io/refs/heads/master/Demo/Data/if_top_bottom_data_prepared_7B.json"];

        var defaultColor = d3.rgb("#d4d4d4");

        // global title
        d3.select("#titleContainer").append("div").append("h3")
            .attr("class", "page-header text-center sub-header=")
            .text("Procedural Knowledge in Pretraining Drives LLM Reasoning");
    
        // select info svg and put some text
        var infoContainer = d3.select("#info")
            .attr("class", "col-xs-12");
        // URL to blog
        infoContainer.append("h4")
            .text("Want to know more?")
        infoContainer.append("a")
            .attr("href", "http://lauraruis.github.io/2024/11/10/if.html")
            .text("Read the blogpost")
            .style("color", "blue")
            .style("text-decoration", "none");
    
    
        // append svg for map
        var queryTableContainer = d3.select("#charts")
            .attr("class", "col-xs-5")
            // hide overflow
            .style("overflow", "hidden")
            .style("float", "left");
    
        // initialize array for keeping track of selected countries
        var selectedQuery = "";
        var selectedQueryData = "";
        var selectedDoc = "";
        var selectedDocData = "";
    
        // put files in queue
        var queue = d3.queue();
        filenames.forEach(function(filename) {
            queue.defer(d3.json, filename);
        });
        queue.awaitAll(getData);
    
        // store data globally
        var queries = {"35B": [], "7B": []};
        var documents = [];
        var influencesPerQuery = {"35B": [], "7B": []};
        var ranksPerQuery = {"35B": [], "7B": []};
    
        /**
         * Function that pushes the data for the map per year to an array.
         * Then it calls functions to draw the map and initialize the line chart.
         * @param {object} error
         * @param {object} jsons
         * */
        function getData(error, jsons) {
    
            if (error) throw error;
    
            var firstQuery = {};
    
            // get domain for each year and fill dictionary with scaled color per country code
            jsons.forEach(function(json) {
                var minmax = d3.extent(json, function (d) { return d.value; });
                var model = json["model"];
                var colorScale = d3.scaleLinear()
                    .domain(minmax)
                    .range(['#fee0d2', '#de2d26']);
    
                json["test_ids"].forEach(function(item, i) {
                    var query = json["test_sequences"][i].replace(/\n/g, "<br>");
                    var shortenedQuery = json["prompts"][i].replace(/\n/g, "<br>");
                    if (i === 0) {
                        firstQuery[model] = {"id": i, "fullText": query, "shortText": shortenedQuery, "example_id": item};
                    }
                    queries[model].push({"id": i, "fullText": query, "shortText": shortenedQuery, "example_id": item});
                    var influencesQuery = json["influences_cos"][i];
                    console.log(influencesQuery);
                    var ranksQuery = json["ranks_normed"][i];
                    influencesPerQuery[model].push(influencesQuery);
                    ranksPerQuery[model].push(ranksQuery);
                });
                json["training_ids"].forEach(function(item, i) {
                    var document = json["training_sequences"][i].replace(/\n/g, "<br>");
                    var documentBegin = document.substr(0, 150);
                    var documentMiddle = "<br><br> ... <br><br>";
                    var documentEnd = document.substr(document.length - 150, document.length);
                    var shortenedDoc = documentBegin.concat(documentMiddle).concat(documentEnd);
                    if (model == "35B") {
                        documents.push({"id": i, "fullText": document, "shortText": shortenedDoc, "example_id": item});
                    }
                });
            });
            makeTrainTable(firstQuery["7B"], documents, "documents_table",
                "Influence score (normalised)", "7B");
            makeQueryTable(queries["7B"], documents, "7B");
            makeQueryTable(queries["35B"], documents, "35B");
            
            // Trigger a click event on the first query in table 7B
            // d3.select("#table0query7B").click();
            var query = $('#table0query7B');
            query.click();
        }
    
        /**
         * Function that draws empty line chart, ready to be filled with lines.
         * */
        function makeQueryTable(queries, documents, model) {
            // bootstrap table
            var table = queryTableContainer
                    .append("table")
                    .attr("id", "query_table_" + model)
                    .attr("class", "table table-hover table-responsive col-xs-5"),
                thead = table.append("thead"),
                tbody = table.append("tbody");
    
            // change format of data to array for d3's enter function
            var arrQueries = d3.entries(queries);
            var arrDocuments = d3.entries(documents);
    
            // append the header row
            var columns = [model + " query idx", model + " query"];
            thead.append("tr")
                .selectAll("th")
                .data(columns)
                .enter()
                .append("th")
                .attr("data-field", function(d) { return d; })
                .attr("data-sortable", "true")
                .attr("data-sorter", "tableSort")
                // if column 0, make smaller
                .text(function(column) { return column; })
                // resize first column
                .attr(function(column) { return column === columns[0] ? "width: 10%" : "width: 90%"; });

            document.getElementById("query_table_" + model).style.width = "100%";
    
            // create a row for each object in the data
            var rows = tbody.selectAll("tr")
                .data(arrQueries)
                .enter().append("tr")
                .attr("id", function(d, i) { return "table" + i + "query" + model; });
    
            // create a cell in each row for each column
            rows.selectAll("td")
                .data(function(row) {
                    return columns.map(function(column, i) {
                        if (i === 0) {
                            var value = row.value.example_id;
                        } else {
                            var value = row.value.shortText;
                        }
                        return {column: column, value: value}
                    });
                })
                .enter()
                .append("td")
                .attr("class", function(d, i) { return columns[i]; })
                .attr("id", function(d, i) { return i + "query" + model; })
                .attr("data", function(d) { return d.value; })
                .html(function(d) { return d.value });
                

            // make a datatable of it (with search bar and pages)
            var dataTable = $('#query_table_' + model);
            dataTable.DataTable({
    
                // remove option to change amount of shown entries
                "bLengthChange": false,
                "bAutoWidth": false, 
                "aoColumns" : [
                    { sWidth: '10%' },
                    { sWidth: '90%' },
                ]
            });
            // add click event to each row
            dataTable.find('tbody').on('click', 'tr', function () {
                var d = d3.select(this).data()[0];
                var i = d3.select(this).attr("id");
                clickEvent(d, i, arrDocuments, model);
            } );
    
            // when next page or search event is fired, table is redrawn so selected countries have to be colored again
            // dataTable
            //     .on('draw.dt', function() {
            //         dataTable.find("tr")
            //             .css("background-color", "white");
            //         var newFill = "orange";
            //         var thisQuery = d3.select("#" + selected);
            //         $("#" + selected)
            //             .css("background-color", "orange");
            //         thisQuery
            //             .attr("fill", newFill);
            //     });
        }
    
        /**
         * Function that draws table with data.
         * @param {object} query
         * @param {object} data
         * @param {string} table_id
         * @param {string} influence_column
         * */
        function makeTrainTable(query, data, table_id, influence_column, model) {
    
            // bootstrap table
            var table = d3.select("#table").append("table")
                    .attr("id", table_id)
                    .attr("class", "table table-hover table-responsive col-xs-8")
                    .style("overflow", "hidden");
                    // make width 100%
                    // .style("width", "100%"),
                thead = table.append("thead"),
                tbody = table.append("tbody");
    
            // change format of data to array for d3's enter function
            var arrData = d3.entries(data);
    
            // append the header row
            var columns = ["Doc idx", "Pretraining document", "Rank", influence_column];
            thead.append("tr")
                .selectAll("th")
                .data(columns)
                .enter()
                .append("th")
                .attr("data-field", function(d) { return d; })
                .attr("data-sortable", "true")
                .attr("data-sorter", "tableSort")
                .text(function(column) { return column; });
    
            // create a row for each object in the data
            var rows = tbody.selectAll("tr")
                .data(arrData)
                .enter().append("tr")
                .attr("class", function(d) { return d.key; })
                .attr("id", function(d) { return "table" + d.key + "train"; });
    
            // create a cell in each row for each column
            rows.selectAll("td")
                .data(function(row) {
                    return columns.map(function(column, i) {
                        var influence_score = influencesPerQuery[model][query.id][row.value.id];
                        var rank = ranksPerQuery[model][query.id][row.value.id];
                        var value;
                        if (i === 0) {
                            value = row.value.example_id;
                        } else if (i === 1) {
                            value = row.value.shortText;
                        } else if (i === 2) { // Replace 'someOtherCondition' with your second condition
                            value = parseInt(rank);
                        } else {
                            value = parseFloat(influence_score);
                        };
                        
                        // var value = (i % 2) === 0 ? row.value.shortText : parseFloat(influence_score);
                        // if ((i % 2) === 0) {
                        //     var valueBegin = value.substr(0, 150);
                        //     var valueMiddle = "<br><br> ... <br><br>";
                        //     var valueEnd = value.substr(value.length - 150, value.length);
                        //     var value = valueBegin.concat(valueMiddle).concat(valueEnd);
                        // };
                        return {column: column, value: value }
                    });
                })
                .enter()
                .append("td")
                .attr("class", function(d, i) { return columns[i]; })
                .attr("data", function(d) { return d.value; })
                .html(function(d) { return d.value });
            
            // make a datatable of it (with search bar and pages)
            var dataTable = $('#' + table_id);
            dataTable.DataTable({
    
                // remove option to change amount of shown entries
                "bLengthChange": false,
                "bAutoWidth": false, 
                "aoColumns" : [
                    { sWidth: '10%' },
                    { sWidth: '70%' },
                    { sWidth: '10%' },
                    { sWidth: '10%' },
                ]
                
            });
            
            // add click event to each row
            dataTable.find('tbody').on('click', 'tr', function () {
                var d = d3.select(this).data()[0];
                var i = d3.select(this).attr("id");
                clickEventTrainTable(d, i, model);
            } );
    
        }
    
        /**
         * Function that fills table with new data.
         * @param {string} query
         * @param {object} trainData
         * */
        function fillTable(query, trainData, table_id, model) {
            // console.log(selectedDoc);
            // $("#" + selectedQueryDoc)
            //            .css("background-color", "white");
            // collapseText(table, selectedQueryDoc, selectedDoc, "train");
            // selectedDoc = "";
            // selectedDocData = "";
            // change format of data to array for d3's enter function
            // var arrData = d3.entries(data);
    
            var table = $("#" + table_id).DataTable();
            
            table.rows().every( function (i) {
                var data = this.data();
                var value = trainData[i].value.shortText;
                data[0] = trainData[i].value.example_id;
                data[1] = value;
                data[2] = parseInt(ranksPerQuery[model][query.value.id][i]);
                data[3] = parseFloat(influencesPerQuery[model][query.value.id][i]);
                this.data(data);
            });
            
            // sort table on rank
            table.order([2, 'asc']).draw();
        }
    
        function collapseText(table, rowId, rowData, typeDoc, model) {
            // Loop over the rows of the table and only expand the text of the current selected query
            table.rows().every( function (j) {
                if ("table" + j + typeDoc + model === rowId) {
                    var data = this.data();
                    if (typeDoc == "query") {
                        var fullData = rowData.value.shortText;
                    } else {
                        var fullData = rowData.value.shortText;
                    };
                    var idx = rowData.value.example_id;
                    data[0] = idx;
                    data[1] = fullData;
                    this.data(data);
                };
            });
        };
    
        function expandText(table, rowId, rowData, typeDoc, model) {
            // Loop over the rows of the table and only expand the text of the current selected query
            table.rows().every( function (j) {
                if ("table" + j + typeDoc + model === rowId) {
                    var data = this.data();
                    if (typeDoc == "query") {
                        var fullData = rowData.value.fullText;
                    } else {
                        var fullData = rowData.value.fullText;
                    };
                    var idx = rowData.value.example_id;
                    data[0] = idx;
                    data[1] = fullData;
                    this.data(data);
                };
            });
        };
    
        /**
         * Function for click event on countries.
         * @param {string} d
         * @param {string} i
         * @param {object} queryApproxData
         * @param {object} queryTrueData
         * */
        function clickEvent(clickedRowData, i, documents, model) {
            fillTable(clickedRowData, documents, "documents_table", model);
            var thisQuery = d3.select("#" + i);
            var newFill = defaultColor;
            var table = $("#query_table_" + model).DataTable();
            // Check if this query is already selected, then de-select
            if (selectedQuery == i) {
                $("#" + selectedQuery)
                       .css("background-color", "white");
                collapseText(table, selectedQuery, clickedRowData, "query", model);
                selectedQuery = "";
                selectedQueryData = "";
            } else {
                if (selectedQuery !== "") {
                    $("#" + selectedQuery)
                        .css("background-color", "white");
                    }
                    collapseText(table, selectedQuery, selectedQueryData, "query", model);
                    // else select country and add line
                    selectedQuery = i;
                    selectedQueryData = clickedRowData;
                    example_id = clickedRowData.value.example_id;
                    if (example_id >= 0 && example_id < 40) {
                        newFill = "#A189C5";
                    } else if (example_id >= 40 && example_id < 80) {
                        newFill = "#6E9594";
                    } else if (example_id >= 80 && example_id < 90) {
                        newFill = "#F5D45F";
                    } else if (example_id >= 90 && example_id < 100) {
                        newFill = "#FFAC72";
                    }
                    $("#" + i)
                        .css("background-color", newFill);
                    thisQuery
                        .attr("fill", newFill);
                    // Loop over the rows of the table and only expand the text of the current selected query
                    expandText(table, i, clickedRowData, "query", model);
            };
        };
        /**
         * Function for click event on countries.
         * @param {string} d
         * @param {string} i
         * @param {object} queryApproxData
         * @param {object} queryTrueData
         * */
        function clickEventTrainTable(clickedRowData, i, model) {
            var thisDoc = d3.select("#" + i);
            var newFill = defaultColor;
            var table = $("#documents_table").DataTable();
            // Check if this query is already selected, then de-select
            if (selectedDoc == i) {
                $("#" + selectedDoc)
                       .css("background-color", "white");
                collapseText(table, selectedDoc, clickedRowData, "train", "");
                selectedDoc = "";
                selectedDocData = "";
            } else {
                if (selectedDoc !== "") {
                    $("#" + selectedDoc)
                        .css("background-color", "white");
                    }
                    collapseText(table, selectedDoc, selectedDocData, "train", "");
                    // else select country and add line
                    selectedDoc = i;
                    selectedDocData = clickedRowData;
                    newFill = "#ACC9BF";
                    $("#" + i)
                        .css("background-color", "#ACC9BF");
                    thisDoc
                        .attr("fill", newFill);
                    // Loop over the rows of the table and only expand the text of the current selected query
                    expandText(table, i, clickedRowData, "train", "");
            };
        }
    };
    