$( document ).ready(function()
{
	var mContent = $( "#movie" );
	var mInput   = $( "#commandMovie" );
	var mLoad    = $( "#commandMovie" );
	var mError   = $( ".error" );
	var mMovies  = $( ".movies" );
	var mInfo    = {
		main : $( ".info" ),
		count: $( ".info span:eq(0)")
	};

	var mMovie = {
		poster: 	$("#moviePoster img"),
		name: 		$("#movieName #movieNameCs"),
		nameEn: 	$("#movieName #movieNameEn"),
		circle: 	$("#movieRating"),
		rating: 	$("#movieRate span"),
		genres: 	$("#movieGenres span"),
		year: 		$("#movieYear span:eq(1)"),
		countries:  $("#movieYear span:eq(0)"),
		runtime: 	$("#movieRuntime span"),
		directors:  $("#movieDirectors span"),
		actors: 	$("#movieActors div"),
		plot: 		$("#moviePlot"),
		error: 		$("#movieError")    		
	};

	var lastMovies = null;
	var lastMovie = null;

	/*
	 * DECLARATION
	 */
	var mLastMovie = "";
	var mBaseUrl   = "http://csfdapi.cz";
	var mSearchUrl = mBaseUrl + "/movie?search=";
	var mTurl      = "https://yts.re/api/list.jsonp?limit=4&genre=ALL&quality=ALL&keywords=";
	var mJqxhr	   = null;
	var mMovieXhr  = null;
	var mYear 	   = 0;

	/*
	 * INIT PLUGIN
	 */
	mInput.focus();
	mInput.keypress(function(e) { 
		if (e.keyCode == 13) 
		{
			findMovie(event);
			return ;
		}
	});

	$('body').delegate('.more', 'click', showMore);
	$('body').delegate('.itemMovie', 'click', loadItemMovie);
	$('body').delegate('.openUrl', 'click', openTab);

	/*
	 * @brief set method set loading
	 */
	var set = 
	{
		loading: 
		{
			on: function()
			{
				mLoad.css('background-image', 'url(loader.gif)');
			},
			off: function()
			{
				mLoad.css('background-image', 'url(enter.png)');
			}
		}
	};

	/*
	 * @brief openTab method open new tab
	 * @event 	  
	 */ 
	function openTab(event)
	{
		event.preventDefault();
		var el  	= $(this);
		var url 	= el.data('url');
		if (url)
			redirect(url);
	}

	/*
	 * @brief findMovie method to find movie on CSFD
	 * @event object
	 */
	function findMovie(event)
	{  			
		var inputValue = mInput.val();
		if (inputValue.length < 3)
			return ;

		if (mLastMovie == inputValue && event.keyCode != 13)
			return ;

		mLastMovie = inputValue;

		if (mJqxhr)
			mJqxhr.abort();

		set.loading.on();

		mJqxhr = $.ajax({
		  url: mSearchUrl + inputValue,
		  datatype: 'json'
		});

		mJqxhr.success(function(movie)
		{
			lastMovies = null;
			mError.hide();
			mInfo.count.text(movie.length);
			mInfo.main.show();

			if (movie.length == 0)
				set.loading.off();

			if (movie.length > 0)
				loadMovie( movie[0] );

			if (movie.length > 1)
			{
				lastMovies = movie;
				mMovies.text("");
				
				var appendContent = "";
				for(var index in movie) { 

				    if (parseInt(index) == 9)
				    {
				    	appendContent += "<span class='more'>...</span>";
				    	appendContent += "<div class='moreHide'>";
				    	if (movie.length > 10)
				    		appendContent += ", ";
				    }

				    appendContent += "<span class='itemMovie' data-index='" + index + "'>";
				    appendContent += movie[index].names['cs'];
				    appendContent += typeof movie[index].year !== 'undefined'? " (" + movie[index].year + ")" : "";
				    appendContent += "</span>";
				    
				    if (movie.length != parseInt(index) + 1 && index != 8)
				    	appendContent += ", ";

				}

				if (movie.length > 9)
					appendContent += "</div>";

				$(appendContent).appendTo(mMovies);
				mMovies.show();
			}

		});

		mJqxhr.error(function(object)
		{
			if (object.statusText == "abort")
				return ;
			
			mError.show();
			mInfo.main.hide();
			
			set.loading.on();

		});

	}

	/*
	 * @brief loadMovie load movie content from CSFD
	 * @event movieUrl string with movie ID
	 */
	function loadMovie(movie)
	{
		lastMovie = movie;
		setMovieContent(movie, 1);
		mYear = 0;
		if (mMovieXhr)
			mMovieXhr.abort();

		set.loading.on();

		mMovieXhr = $.ajax({
		  url: mBaseUrl + movie.api_url,
		  datatype: 'json'
		});


		mMovieXhr.error(function(object)
		{
			if (object.statusText == "abort")
				return ;
			
			mError.show();
			mInfo.main.hide();
			set.loading.off();

		});

		mMovieXhr.success(function(movie)
		{
			setMovieContent(movie, 2);
		});

		mMovieXhr.done(function()
		{
			set.loading.off();
		});
	}

	function setMovieContent(movie, attempt)
	{
			movieClear();
			mError.hide();
			mInfo.main.show();

			var errorPrint = false;

			var enName = "";
			if (typeof movie.names['en'] !== 'undefined')
				enName = movie.names['en'];
			else if (typeof movie.names['velká'] !== 'undefined')
				enName = movie.names['velká'];
			else if (typeof movie.names['originální'] !== 'undefined')
				enName = movie.names['originální'];


			if (typeof movie.poster_url !== "undefined") 
			{
				mMovie.poster.attr('src', movie.poster_url);
			}
			else if (typeof lastMovie.poster_url !== "undefined")
			{
				mMovie.poster.attr('src', lastMovie.poster_url);
				if (attempt = 2) errorPrint = true;
			}
			else if (attempt == 2)
			{
				errorPrint = true;
			}

			if (typeof movie.csfd_url !== "undefined" && movie.csfd_url != "")
			mMovie.poster.data('url', movie.csfd_url);
			else if (typeof lastMovie.csfd_url !== "undefined")
			mMovie.poster.data('url', lastMovie.csfd_url);

			if (typeof movie.names['cs'] !== "undefined" && movie.names['cs'] != "")
			mMovie.name.text(movie.names['cs']);
			else if (typeof lastMovie.names['cs'] != "undefined")
			mMovie.name.text(lastMovie.names['cs']);	

			if (typeof movie.csfd_url !== "undefined" && movie.csfd_url != "")
			mMovie.name.data('url', movie.csfd_url);
			else if (typeof lastMovie.csfd_url != "undefined")
			mMovie.name.data('url', lastMovie.csfd_url);

			mYear = typeof movie.year != 'undefined'? movie.year : 0;
			if (mYear == 0 && typeof lastMovie.year != 'undefined')
				mYear = lastMovie.year; 

			if (enName != "")
			{
				mMovie.nameEn.html("<br />" + enName);
				mMovie.nameEn.data('url', movie.csfd_url);
			}

			if (typeof movie.rating !== 'undefined')
			{
				mMovie.circle.css('background-color', getMovieColor(movie.rating));
				mMovie.rating.css('color', getMovieColor(movie.rating)).text(movie.rating);
			}
			else
			{
				mMovie.circle.css('background-color', getMovieColor(0));
				mMovie.rating.css('color', getMovieColor(0)).text(movie.rating);	
			}

			var appendContent = "";
			if (typeof movie.genres != "undefined" && movie.genres.length != 0)
			{
				for(var index in movie.genres) { 
					appendContent += movie.genres[index];
					if (parseInt(index)+1 != movie.genres.length)
						appendContent += ", ";
				}
			} 
			else if (typeof lastMovie.genres != "undefined" && lastMovie.genres.length != 0)
			{
				for(var index in lastMovie.genres) { 
					appendContent += lastMovie.genres[index];
					if (parseInt(index)+1 != lastMovie.genres.length)
						appendContent += ", ";
				}
			}

			mMovie.genres.text(appendContent);

			if (typeof movie.year !== 'undefined')
			mMovie.year.text(movie.year);
			else if (typeof lastMovie.year !== 'undefined')
			mMovie.year.text(lastMovie.year);

			if (typeof movie.countries !== 'undefined')
			{
				var appendContent = "";
				for(var index in movie.countries) { 
					appendContent += movie.countries[index];
					if (parseInt(index)+1 != movie.countries.length)
						appendContent += ", ";
				}
				mMovie.countries.text(appendContent);
			}
			else if (typeof lastMovie.countries !== 'undefined')
			{
				var appendContent = "";
				for(var index in lastMovie.countries) { 
					appendContent += lastMovie.countries[index];
					if (parseInt(index)+1 != lastMovie.countries.length)
						appendContent += ", ";
				}
				mMovie.countries.text(appendContent);
			}
			
			if (movie.runtime)
				mMovie.runtime.text(movie.runtime);
		

			var authors = (typeof movie.authors !== 'undefined')? movie.authors : (typeof lastMovie.authors !== 'undefined'? lastMovie.authors : false);

			if (authors)
			{
				if (typeof authors.directors !== "undefined")
				{
    				var appendContent = "";
					for(var index in authors.directors) { 

						if (parseInt(index) == 4)
						{
							appendContent += "<span class='more'>...</span>";
						    appendContent += "<div class='moreHide'>";
						    if (authors.directors.length > 4)
						    	appendContent += ", ";
						}

						appendContent += "<span class='openUrl' data-url='" + authors.directors[index].csfd_url + "'>";
						appendContent += authors.directors[index].name;
						appendContent += "</span>";
						if (parseInt(index) + 1 != authors.directors.length && parseInt(index) != 3)
							appendContent += ", ";

					}
					if (authors.directors.length > 3)
						appendContent += "</div>";
    				mMovie.directors.html(appendContent);
				}

				if (typeof authors.actors !== "undefined")
				{
    				var appendContent = "";
					for(var index in authors.actors) { 

						if (parseInt(index) == 6)
						{
							appendContent += "<span class='more'>...</span>";
						    appendContent += "<div class='moreHide'>";
						    if (authors.actors.length > 6)
						    	appendContent += ", ";
						}

						appendContent += "<span class='openUrl' data-url='" +authors.actors[index].csfd_url + "'>";
						appendContent += authors.actors[index].name;
						appendContent += "</span>";
						
						if ((parseInt(index) + 1) != authors.actors.length && parseInt(index) != 5)
							appendContent += ", ";

					}
					if (authors.actors.length > 5)
						appendContent += "</div>";
    				mMovie.actors.html(appendContent);
    			}
			}
			
			if (movie.plot != 'undefined')
			mMovie.plot.text(movie.plot);

			if (typeof lastMovie.csfd_url !== "undefined")
				mMovie.error.find('td span').data('url', lastMovie.csfd_url);

			if (errorPrint)
			    mMovie.error.show();

			mContent.css('display', 'table-cell');
	}

	/*
	 * @brief showMore print more options
	 */
	function showMore()
	{
		var el = $(this);

		el.next().css('display', 'inline');
		el.hide();
	}

	/*
	 * @brief loadItemMovie load movie from options
	 */
	function loadItemMovie()
	{
		var el = $(this);
		var index = el.data('index');
		loadMovie(lastMovies[index]);
	}

	/*
	 * @brief movieClear clear data from content
	 */
	function movieClear()
	{
		mMovie.poster.attr('src','');
		mMovie.poster.data('url','');
		mMovie.name.text('');
		mMovie.name.data('url','');
		mMovie.nameEn.text('');
		mMovie.nameEn.data('url','');
		mMovie.rating.text('0');
		mMovie.genres.text('');
		mMovie.year.text('0');
		mMovie.countries.text('');
		mMovie.runtime.text('0s');
		mMovie.directors.text('');
		mMovie.actors.text('');
		mMovie.plot.text('');
		mMovie.error.hide();
	}

	/*
	 * @brief getMovieColor return color
	 * @movie_rating rating number
	 */
	function getMovieColor(movie_rating)
	{
		/*
		* Colors: #535353 25% <, #658db4 70% <, #b01 70% >=
		*/	
		var rColor = "#535353";
		if (movie_rating >= 70)
			rColor = "#b01";
		else if (movie_rating >= 25)
			rColor = "#658db4";

		return rColor;
	}
});