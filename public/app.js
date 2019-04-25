$(document).ready(function () {

  // Grab the articles as a json
  $.getJSON("/articles", data => {
    if (data.length > 0) {
      $("#articles").empty();
      // For each one
      for (let i = 0; i < data.length; i++) {
        // Display the apropos information on the page
        const article = renderArticleHome(data[i]);
        $("#articles").append(article);
      }
    }

  });

  function renderArticleHome(data) {
    let article = $("<div>").addClass('article').html(
      `
      <div class="card" style="width: 18rem;">
        <img src=${data.image} class="card-img-top" alt="...">
        <i class="fas fa-cloud-download-alt save fa-2x" data-id=${data._id}></i>
        <div class="card-body">
          <a href=${data.link} target='_blank'><p class="card-text">${data.title}</p></a>
        </div>
      </div>
      `
    );
    return article;
  }
  function renderSaved(data) {
    let article = $("<div>").addClass('article').html(
      `
      <div class="card" style="width: 18rem;">
        <img src=${data.image} class="card-img-top" alt="...">
        <button class="note" type="button" data-toggle="modal" data-target="#exampleModalCenter">
          <i class="fas fa-clipboard note fa-2x" data-id=${data._id}></i>
        </button>
        <i class="fas fa-minus-circle delete fa-2x" data-id=${data._id}></i>
        <div class="card-body">
          <a href=${data.link} target='_blank'><p class="card-text">${data.title}</p></a>
        </div>
      </div>
      `
    );
    return article;
  }

  //NaV clicks
  // Scarpe button
  $("#scrape").on('click', function () {
    $.ajax({
      method: "GET",
      url: "/scrape"
    }).then(data => {
      console.log('scraped');
      $.getJSON("/articles", data => {
        if (data.length > 0) {
          $("#articles").empty();
          // For each one
          for (let i = 0; i < data.length; i++) {
            // Display the apropos information on the page
            const article = renderArticleHome(data[i]);
            $("#articles").append(article);
          }
        }

      });
    })
  })

  $("#saved").on('click', function () {
    $.ajax({
      method: "GET",
      url: "/saved"
    }).then(data => {
      // if (data.length > 0) {
      $("#articles").empty();
      // For each one
      for (let i = 0; i < data.length; i++) {
        // Display the apropos information on the page
        const article = renderSaved(data[i]);
        $("#articles").append(article);
      }
      // }
      renderSaved();
    })
  })

  //clear db
  $('#clear').on('click', function () {
    $.ajax({
      method: "GET",
      url: "/clear"
    }).then(res => {
      console.log('deleted');
      $('#articles').html('no articles. get scrapin');

    })
  });

  $('#home').on('click', function () {
    $.getJSON("/articles", data => {
      if (data.length > 0) {
        $("#articles").empty();
        // For each one
        for (let i = 0; i < data.length; i++) {
          // Display the apropos information on the page
          const article = renderArticleHome(data[i]);
          $("#articles").append(article);
        }
      }

    });
  });


  // When user click's update button, update the specific note
  $(document).on("click", ".save", function () {
    // Save the selected element
    let selected = $(this);
    console.log(selected.attr('data-id'));
    // Make an AJAX POST request
    // This uses the data-id of the update button,
    // which is linked to the specific note title
    // that the user clicked before
    $.ajax({
      type: "POST",
      url: "/save/" + selected.attr("data-id"),
      dataType: "json",
      data: {
        saved: true
      },
      // On successful call
      success: (data) => {
        console.log('saved!');
      }
    });
  });
  // Whenever someone clicks a p tag
  $(document).on("click", "p", function () {
    // Empty the notes from the note section
    $("#notes").empty();
    // Save the id from the p tag
    const thisId = $(this).attr("data-id");

    // Now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      // With that done, add the note information to the page
      .then(data => {
        console.log(data);
        // The title of the article
        $("#notes").append("<h2>" + data.title + "</h2>");
        // An input to enter a new title
        $("#notes").append("<input id='titleinput' name='title' >");
        // A textarea to add a new note body
        $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
        // A button to submit a new note, with the id of the article saved to it
        $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

        // If there's a note in the article
        if (data.note) {
          // Place the title of the note in the title input
          $("#titleinput").val(data.note.title);
          // Place the body of the note in the body textarea
          $("#bodyinput").val(data.note.body);
        }
      });
  });

  // When you click the savenote button
  $(document).on("click", "#savenote", function () {
    // Grab the id associated with the article from the submit button
    const thisId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
      // With that done
      .then(data => {
        // Log the response
        console.log(data);
        // Empty the notes section
        $("#notes").empty();
      });

    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });



  // unsave an article
  $(document).on("click", ".delete", function () {
    // Save the selected element
    let selected = $(this);
    console.log(selected.attr('data-id'));
    // Make an AJAX POST request
    // This uses the data-id of the update button,
    // which is linked to the specific note title
    // that the user clicked before
    $.ajax({
      type: "POST",
      url: "/unsave/" + selected.attr("data-id"),
      dataType: "json",
      data: {
        saved: false
      },
      // On successful call
      success: (data) => {
        console.log('article removed from saved');
      }
    }).then(function () {
      console.log("in it");
      $.getJSON("/saved", data => {

        $("#articles").empty();
        // For each one
        for (let i = 0; i < data.length; i++) {
          // Display the apropos information on the page
          const article = renderSaved(data[i]);
          $("#articles").append(article);
        }


      });
    });
  });

});

