/** @jsx React.DOM */

var Time = React.createClass({
	render: function() {
		var datetime = moment(this.props.dateTime);
		var rfcFormatted = datetime.format("YYYY-MM-DDTHH:mm:ssZ");
		var formatted = datetime.format(this.props.format || "YYYY-MM-DD h a");


		return (
			<time dateTime={ rfcFormatted }>{ formatted }</time>
		);
	}
});

var BuildingMeta = React.createClass({
	loadDataFromServer: function() {
		$unibuddy.loadBuildingMeta(this.props.code, function(building) {
			this.setState({ data: building });
		}.bind(this));
	},
	getInitialState: function() {
		return { data : { code: "", name: "" } };
	},
	componentWillMount: function() {
		this.loadDataFromServer();
	},
	render: function() {
		return (
			<div className="buildingMeta">
				<h1>Welcome to { this.state.data.name } at Flinders University</h1>
			</div>
		);
	}
});

var BuildingBookings = React.createClass({
	loadDataFromServer: function() {
		$unibuddy.loadRooms(this.props.code, function(rooms) {
			this.setState({ data: rooms });
		}.bind(this));
	},
	getInitialState: function() {
		return { data : [] };
	},
	componentWillMount: function() {
		this.loadDataFromServer();

		if (this.props.polling) {
			setInterval(loadDataFromServer, this.props.polling);
		}
	},
	render: function() {

		var freeRooms = this.state.data.filter(function (room) { return room.is_empty; });
		var occupiedRooms = this.state.data.filter(function (room) { return !room.is_empty; });

	    var freeRoomNodes = freeRooms.map(function (room) {
	      return <li>
		      	<div className="room">{ room.building_code } { room.code } <br />
		      	Next: <RoomBooking booking={ room.next_booking } /></div>
	      	</li>;
	    });
	    var occupiedRoomNodes = occupiedRooms.map(function (room) {
	      return <li>
		      	<div className="room">{ room.building_code } { room.code } <br />
		      	Now: <RoomBooking booking={ room.current_booking } /> <br />
		      	Next: <RoomBooking booking={ room.next_booking } /></div>
	      	</li>;
	    });

		return (
			<div>
				<h2>Free Rooms</h2>
				<ul>
					{ freeRoomNodes }
				</ul>
				<h2>Occupied Rooms</h2>
				<ul>
					{ occupiedRoomNodes }
				</ul>
			</div>
		);
	}
});


var RoomBooking = React.createClass({
	render: function() {
		var booking = this.props.booking;

		if (!booking) {
			// hack for returning nothing, see https://github.com/facebook/react/issues/108
			return <span className="booking empty">None</span>; 
		}
		return <span className="booking">{ booking.description } on <Time dateTime={ booking.starts_at } /></span>;
	}
});

var BuildingSlideshow = React.createClass({
	getInitialState: function() {
		return { slide : 0 };
	},
	componentWillMount: function() {
		setInterval(function() {
			this.state.slide++;
			this.forceUpdate();
		}.bind(this), this.props.slideTime);
	},
	render: function() {
		var numSlides = 2;

		var currentSlide = this.state.slide % numSlides;

		var code = this.props.code;

		var slide;
	
		if (currentSlide === 0) {
			slide = (
				<BuildingBookings code={ code } />
			);
		}
		else if (currentSlide == 1) {
			slide = (
				<NewsFeed polling={60000} />
			);
		}

		var progressBar = <TimedProgressBar duration={this.props.slideTime} />;

		return (
			<div className="buildingSlideshow">
				{ progressBar }
				<BuildingMeta code={ code } />
				{ slide }
			</div>
		);
	}
});

var NewsFeed = React.createClass({
	loadDataFromServer: function() {
		$unibuddy.getNews(function(building) {
			this.setState({ data: building });
		}.bind(this));
	},
	getInitialState: function() {
		return { data : [] };
	},
	componentWillMount: function() {
		this.loadDataFromServer();

		if (this.props.polling) {
			setInterval(this.loadDataFromServer, this.props.polling);
		}
	},
	render: function() {
	    var newsNodes = this.state.data.map(function (article) {
	      return <li><h1>{ article.title }</h1><p>{ article.plaintext }</p></li>;
	    });

		return (
			<div className="newsFeed">
				<h1>News</h1>
				<ul>
					{ newsNodes }
				</ul>
			</div>
		);
	}
});

var TimedProgressBar = React.createClass({
	getInitialState: function() {
		return { start : new Date().getTime() };
	},
	componentWillMount: function() {
		this.state.start = new Date().getTime();

		var interval = setInterval(function() {
			var ranFor = new Date().getTime() - this.state.start;
			this.state.percent = Math.min(100, 100 * ranFor / this.props.duration);
			this.forceUpdate();
		}.bind(this), 20);
	},
	componentWillReceiveProps: function() {
		this.state.start = new Date().getTime();
		this.forceUpdate();
	},
	render: function() {
		var ProgressBar = ReactBootstrap.ProgressBar;
		return <ProgressBar className="slideIndicator" now={ this.state.percent } />;
	}
});

React.renderComponent((
	<BuildingSlideshow slideTime="10000" code="IST" />
	), document.body);
