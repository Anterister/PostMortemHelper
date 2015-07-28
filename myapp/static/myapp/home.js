/// <reference path="../App.js" />
// global app

(function () {
    'use strict';


    // ctx.customData = OfficeExtension.Constants.iterativeExecutor;


    // The initialize function must be run each time a new page is loaded
    Office.initialize = function (reason) {
        $(document).ready(function () {
            app.initialize();

            $('#btn-debug').click(replace_cc);
            $("#bugQueryForm").submit(function(event){
                event.preventDefault();
                query_bug();
            });

            $('#btn-list-bugs').click(find_list_bugs);

            $('#cb-alias').change(function() {
                if ($(this).is(":checked")) {
                    get_alias();

                } else {
                    // $('')
                }
            })

        });
    };

    function get_alias() {
        // app.showNotification("0");
        var net = new ActiveXObject ( "WScript.NetWork" );
        // app.showNotification("1");
        var username = net.UserName;
        $('#div-bug').text(username);
    }


    function find_list_bugs() {
        $('#loading').show();
        $('#div-bug').text("");
        $.get("/get_list_bugs/", 
            {'alias':$('#resposibleAlias').val()}, 
            function(data) {
                $('#loading').hide();
                $('#div-list-bugs').html("<p>loading..</p>");
                var record = "<h4>" + data.count + " resolved bugs of severity 1 found.</h4>";
                record += "<p>[Bug #][Opened Time][Resolved By][Bug title]</p>";
                for (var i in data.bugs) {
                    // $('#div-list-bugs').html(data.bugs[i]);
                    var b = data.bugs[i];
                    record += "<div class='bugSnip'>&nbsp;&nbsp;<b>" + b[0] + "</b>" + 
                            "&nbsp;&nbsp;" + b[1] + "&nbsp;UTC&nbsp;&nbsp;<strong>" + 
                            b[6] + "</strong>&nbsp;&nbsp;</br>" + 
                            b[3] + "</br ></br ></div>" +



                            "<div class='bugDetail'><div class='bd-content'>" + 
                            
                            "<h5>Full bug title</h5>" + b[2] + 
                            "<h5>Accountable team</h5>" + b[4] + 
                            // "<h5>Assigned To</h5>" + b[7] + 
                            "<h5>Resolved By</h5>" + b[6] + 
                            "<h5>Opened By</h5>" + b[5] + 

                            "</div></div>" + 
                            "<div class='bug-id' style='display:none;'>" + b[0] + "</div>";
                }
                record += "</ul>";
                $('#div-list-bugs').html(record);

                $('.bugSnip')
                    .css('cursor', 'pointer')
                    .click(
                        function(){
                            $("#searchBugNum").val($(this).next().next().text());
                            query_bug();
                        }
                    )
                    .hover(
                        function(){
                            $(this).css({'color':'#2C4E8B', "font-size": 13});
                            $(this).next().show();
                        },
                        function(){
                            $(this).next().hide();
                            $(this).css({'color':'black', "font-size": 12});
                        }
                    );
            }
        );
    }

    function replace_cc() {
        var ctx = new Word.WordClientContext();
            app.showNotification("1", "");
            var ccs = ctx.document.contentControls.getByTitle("RCA Description");
            app.showNotification("2", "");
            ctx.load(ccs);
            app.showNotification("3", "");
            // ccs.getItemAt(0).insertText('123123123', 'replace');
            // ccs.getItemAt(0).font.italic = true;


            ctx.executeAsync().then(
                function () {
                    app.showNotification("4", ccs.items.length);
                    ccs.items[0].insertHtml("awerawrrrrrrawerawrrrrrraweraw" +
                        "rrrrrrawerawrrrrrrawerawrrrrrrawerawrrrrrrawerawrrrrrr" +
                        "awerawrrrrrrawerawrrrrrrawerawrrrrrrawerawrrrrrrawerawr"
                        + "123333333333333333333333"
                        ,"replace");
                    // var ccText = css.getItem(0).text;
                    app.showNotification("5", "");
                    // app.showNotification(ccs.getItem(0), "");
                    ctx.executeAsync().then(
                        function () {
                            app.showNotification("6", "");
                            // app.showNotification(ccText.value, "");
                            // console.log("Content Control Text: " + ccText.value);
                        }
                     );
                    // console.log("Content control Id: " + myContentControl.id);
                },
                function (result) {
                    // console.log("Failed: ErrorCode=" + result.errorCode + ", ErrorMessage=" + result.errorMessage);
                    console.log(result.traceMessages);
                }
            );
    }


  function query_bug() {
    var bugNum = $('#searchBugNum').val();
    if (bugNum == '') {
        app.showNotification("Please enter a bug number", "");
    } else {
        $('#div-list-bugs').text("");
        // $('#div-bug').html("<p>loading..</p>");
        $('#loading').show();
        app.hideNotification();
        $.get("/query_bug_by_id/", 
          {'bug_id' : bugNum},
            function(data) {

                $('#div-bug').html("<div id='bugHead' class='textWrapper'><h3>Bug with ID " + 
                    bugNum + " found.</h3>" +
                    "<a id='clearAllBug' href='#' class='undoCC'>Clear all</a></br></div>");

                var ctx = new Word.WordClientContext();
                // app.showNotification("1", "");
                var ccs_title = ctx.document.contentControls.getByTitle("Title");
                var ccs_id = ctx.document.contentControls.getByTitle("TFS ID");
                var ccs_severity = ctx.document.contentControls.getByTitle("Severity");
                var ccs_team = ctx.document.contentControls.getByTitle("Service Responsible");
                var ccs_ttrestore = ctx.document.contentControls.getByTitle("TTRestore");
                var ccs_owner = ctx.document.contentControls.getByTitle("Owner: Dev");
                var ccs_rca = ctx.document.contentControls.getByTitle("RCA Description");

                // app.showNotification("2", "");
                ctx.load(ccs_title);
                ctx.load(ccs_id);
                ctx.load(ccs_severity);
                ctx.load(ccs_team);
                ctx.load(ccs_ttrestore);
                ctx.load(ccs_owner);
                ctx.load(ccs_rca);

                // app.showNotification("3", "");

                ctx.executeAsync().then(
                    function () {

                        // app.showNotification("4", ccs_title.items.length);

                        if (ccs_title.items.length > 0) {
                            $('#div-bug').append(
                                "<div class='textWrapper'><p>> <b>Bug title</b> content control found.</p>" + 
                                "</p>Replacing text with '" + String(data.title).substring(0,20) + 
                                "..'</p><a id='undoTitle' href='#' class='undoCC'>Undo</a></div>");

                            ccs_title.items[0].insertText(String(data.title), "replace");
                        } else {
                            $('#div-bug').append("<h4><span style='color: #990000;'>Bug title cc not found!</span></h4>");
                        }

                        if (ccs_id.items.length > 0) {
                            $('#div-bug').append( 
                                "<div class='textWrapper'><p>> <b>Bug id</b> content control found.</p>" + 
                                "</p>Replacing text with '" + String(bugNum) + 
                                "'..</p><a id='undoId' href='#' class='undoCC'>Undo</a></div>");
                            ccs_id.items[0].insertText(bugNum, "replace");
                        } else {
                            $('#div-bug')
                            .append("<h4><span style='color: #990000;'>Bug id cc not found!</span></h4>");
                        }

                        if (ccs_severity.items.length > 0) {
                            $('#div-bug').append( 
                                "<div class='textWrapper'><p>> <b>Bug severity</b> content control found.</p>" + 
                                "</p>Replacing text with '" + String(data.severity) + 
                                "'..</p><a id='undoSeverity' href='#' class='undoCC'>Undo</a></div>");
                            // app.showNotification("4", data.severity);
                            ccs_severity.items[0].insertText(String(data.severity), "replace");
                        } else {
                            $('#div-bug').append("<h4><span style='color: #990000;'>Bug severity cc not found!</span></h4>");
                        }

                        if (ccs_team.items.length > 0) {
                            $('#div-bug').append(
                                "<div class='textWrapper'><p>> <b>Team Responsible</b> content control found.</p>" + 
                                "</p>Replacing text with '" + String(data.accountable_team) + 
                                "'..</p><a id='undoTeam' href='#' class='undoCC'>Undo</a></div>");
                            ccs_team.items[0].insertText(String(data.accountable_team), "replace");
                        } else {
                            $('#div-bug').append("<h4><span style='color: #990000;'>Bug severity cc not found!</span></h4>");
                        }

                        if (ccs_ttrestore.items.length > 0) {
                            $('#div-bug').append(
                                "<div class='textWrapper'><p>> <b>Bug restore time</b> content control found.</p>" + 
                                "</p>Replacing text with '" + String(data.duration) + 
                                "'..</p><a id='undoTTRestore' href='#' class='undoCC'>Undo</a></div>");
                            ccs_ttrestore.items[0].insertText(String(data.duration), "replace");
                        } else {
                            $('#div-bug').append("<h4><span style='color: #990000;'>Bug restore time cc not found!</span></h4>");
                        }

                        if (ccs_owner.items.length > 0) {
                            $('#div-bug').append(
                                "<div class='textWrapper'><p>> <b>Bug dev owner</b> content control found.</p>" + 
                                "</p>Replacing text with '" + String(data.dev) + 
                                "'..</p><a id='undoOwner' href='#' class='undoCC'>Undo</a></div>");
                            ccs_owner.items[0].insertText(String(data.dev), "replace");
                        } else {
                            $('#div-bug').append("<h4><span style='color: #990000;'>Bug dev owner cc not found!</span></h4>");
                        }

                        if (ccs_rca.items.length > 0) {
                            $('#div-bug').append(
                                "<div class='textWrapper'><p>> <b>Bug root cause</b> content control found.</p>" + 
                                "</p>Replacing text..</p><a id='undoRca' href='#' class='undoCC'>Undo</a></div>");
                             var record = "<h4>Descriptions</h4><ul>"
                            record += "<h5>[UTC time][Time to last change][Time to open][Description]</h5>"
                            for (var i in data.descriptions) {
                                var d = data.descriptions[i];
                                record += "<li><b>[UTC " + d[0] + "]</b>&nbsp;[" + d[2] + 
                                " mins][" + d[3] + " mins]&nbsp;" + d[1] + "</li>";
                            }
                            record += "</ul>";
                            ccs_rca.items[0].insertHtml(record, "replace");
                            // ccs_rca.items[0].insertText("#################################", "start");
                            if (data.repro_steps) {
                                ccs_rca.items[0].insertHtml("<h4>Repro Steps</h4>" + String(data.repro_steps), "start");
                            }

                        } else {
                            $('#div-bug').append("<h4><span style='color: #990000;'>Bug root cause cc not found!</span></h4>");
                        }
                        
                        ctx.executeAsync().then(function(){

                            app.hideNotification();
                            $('#loading').hide();

                            $('#clearAllBug').click(function() {
                                var thisA = $(this);
                                $('#loading').show();
                                if (thisA.text() == 'Clear all') {
                                    ccs_title.items[0].clear();
                                    ccs_id.items[0].clear();
                                    ccs_severity.items[0].clear();
                                    ccs_team.items[0].clear();
                                    ccs_ttrestore.items[0].clear();
                                    ccs_owner.items[0].clear();
                                    ccs_rca.items[0].clear();

                                    ctx.executeAsync().then(function() {
                                        $('.undoCC').text("Redo");
                                        $('.undoCC').css('background', '#2C4E8B');
                                        $('#loading').hide();
                                    });
                                } else {
                                    ccs_title.items[0].insertText(String(data.title), "replace");
                                    ccs_id.items[0].insertText(bugNum, "replace");
                                    ccs_severity.items[0].insertText(String(data.severity), "replace");
                                    ccs_team.items[0].insertText(String(data.accountable_team), "replace");
                                    ccs_ttrestore.items[0].insertText(String(data.duration), "replace");
                                    ccs_owner.items[0].insertText(String(data.dev), "replace");

                                    var record = "<h4>Descriptions</h4><ul>";
                                    record += "<h5>[UTC time][Time to last change][Time to open][Description]</h5>";
                                    for (var i in data.descriptions) {
                                        var d = data.descriptions[i];
                                        record += "<li><b>[UTC " + d[0] + "]</b>&nbsp;[" + d[2] + 
                                        " mins][" + d[3] + " mins]&nbsp;" + d[1] + "</li>";
                                    }
                                    record += "</ul>";
                                    ccs_rca.items[0].insertHtml(record, "replace");
                                    // ccs_rca.items[0].insertText("#################################", "start");
                                    if (data.repro_steps) {
                                        ccs_rca.items[0].insertHtml("<h4>Repro Steps</h4>" + String(data.repro_steps), "start");
                                    }

                                    ctx.executeAsync().then(function() {
                                        $('.undoCC').text("Undo");
                                        thisA.text("Clear all");
                                        $('.undoCC').css('background', 'black');
                                        $('#loading').hide();
                                    });
                                }
                                
                            });


                            $('.undoCC').click(function() {
                                var thisA = $(this);
                                var thisId = $(this).attr('id');
                                if (thisA.text() == "Undo") {
                                    if (thisId == 'undoTitle') {
                                        ccs_title.items[0].clear();
                                    } else if (thisId == 'undoId') {
                                        ccs_id.items[0].clear();
                                    } else if (thisId == 'undoSeverity') {
                                        ccs_severity.items[0].clear();
                                    } else if (thisId == 'undoTeam') {
                                        ccs_team.items[0].clear();
                                    } else if (thisId == 'undoTTRestore') {
                                        ccs_ttrestore.items[0].clear();
                                    } else if (thisId == 'undoOwner') {
                                        ccs_owner.items[0].clear();
                                    } else if (thisId == 'undoRca') {
                                        ccs_rca.items[0].clear();
                                    }
                                    ctx.executeAsync().then(function() {
                                        thisA.text("Redo");
                                        thisA.css('background', '#2C4E8B');
                                    });
                                    
                                } else if (thisA.text() == "Redo"){
                                    if (thisId == 'undoTitle') {
                                        ccs_title.items[0].insertText(String(data.title), "replace");
                                    } else if (thisId == 'undoId') {
                                        ccs_id.items[0].insertText(bugNum, "replace");
                                    } else if (thisId == 'undoSeverity') {
                                        ccs_severity.items[0].insertText(String(data.severity), "replace");
                                    } else if (thisId == 'undoTeam') {
                                        ccs_team.items[0].insertText(String(data.accountable_team), "replace");
                                    } else if (thisId == 'undoTTRestore') {
                                        ccs_ttrestore.items[0].insertText(String(data.duration), "replace");
                                    } else if (thisId == 'undoOwner') {
                                        ccs_owner.items[0].insertText(String(data.dev), "replace");
                                    } else if (thisId == 'undoRca') {
                                        var record = "<h4>Descriptions</h4><ul>"
                                        record += "<h5>[UTC time][Time to last change][Time to open][Description]</h5>"
                                        for (var i in data.descriptions) {
                                            var d = data.descriptions[i];
                                            record += "<li><b>[UTC " + d[0] + "]</b>&nbsp;[" + d[2] + 
                                            " mins][" + d[3] + " mins]&nbsp;" + d[1] + "</li>";
                                        }
                                        record += "</ul>";
                                        ccs_rca.items[0].insertHtml(record, "replace");
                                        // ccs_rca.items[0].insertText("#################################", "start");
                                        if (data.repro_steps) {
                                            ccs_rca.items[0].insertHtml("<h4>Repro Steps</h4>" + String(data.repro_steps), "start");
                                        }
                                    }
                                    
                                    ctx.executeAsync().then(function() {
                                        thisA.text("Undo");
                                        thisA.css('background', 'black');
                                    });
                                }
                            });
                        });

                    },
                    function (result) {
                        console.log("Failed: ErrorCode=" + result.errorCode + ", ErrorMessage=" + result.errorMessage);
                        console.log(result.traceMessages);
                    }
                );
            }
        );
    }
  }
})();