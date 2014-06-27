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
				<img className="logo" src="images/flinders-logo.png" />
				<h1>Welcome to { this.state.data.name }</h1>
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
	      return (
	      	<tr className="room">
		      	<td className="roomCode">{ room.building_code } { room.code }</td>
		      	<td className="booking next"><RoomBooking booking={ room.next_booking } /></td>
	      	</tr>
	      	);
	    });

	    var occupiedRoomNodes = occupiedRooms.map(function (room) {
	      return (
	      	<tr className="room">
		      	<td className="roomCode">{ room.building_code } { room.code }</td>
		      	<td className="booking current"><RoomBooking booking={ room.current_booking } /></td>
		      	<td className="booking next"><RoomBooking booking={ room.next_booking } /></td>

	      	</tr>
	      	);
	    });

	    var freeRoomsCaption = freeRooms.length ? "" : "There are no free rooms.";
	    var occupiedRoomsCaption = occupiedRooms.length ? "" : "All rooms are free.";

		return (
			<div>
				<h2>Free Rooms</h2>
				<table className="table">
					<tr>
						<th>Topic Code</th>
						<th>Next</th>
					</tr>
					{ freeRoomNodes }
				</table>
				{ freeRoomsCaption }
				<h2>Occupied Rooms</h2>
				<table className="table">
					<tr>
						<th>Topic Code</th>
						<th>Currently</th>
						<th>Next</th>
					</tr>
					{ occupiedRoomNodes }
				</table>
				{ occupiedRoomsCaption }
			</div>
		);
	}
});


var RoomBooking = React.createClass({
	render: function() {
		var booking = this.props.booking;

		if (!booking) {
			return <span className="booking empty">Empty</span>; 
		}
		return <span className="booking">{ booking.description } on <Time dateTime={ booking.starts_at } /></span>;
	}
});

var BuildingSlideshow = React.createClass({
	getInitialState: function() {
		return {
			slide : 0,
			slides : [
				<BuildingBookings code={ this.props.code } />,
				<NewsFeed polling={60000} />,
				<TonsleyFeed />
			]
		};
	},
	componentWillMount: function() {
		setInterval(function() {
			this.state.slide++;
			this.forceUpdate();
		}.bind(this), this.props.slideTime);
	},
	render: function() {
		var slide = this.state.slides[this.state.slide % this.state.slides.length];

		return (
			<div className="buildingSlideshow">
				<TimedProgressBar duration={this.props.slideTime} />
				<BuildingMeta code={ this.props.code } />
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
	    var newsNodes = this.state.data.slice(0, 3).map(function (article) {
	      return (
	      	<div className="news article">
		      	<h3>{ article.title }</h3>
		      	<p>{ article.plaintext }</p>
	      	</div>
	      );
	    });

		return (
			<div className="newsFeed">
				<h2>News</h2>
				{ newsNodes }
			</div>
		);
	}
});

var TonsleyFeed = React.createClass({
	render: function() {
		return (
			<div class="tonsleyFeed">
				<h2>Tonsley Live Feed</h2>
				<iframe src="http://www.flinders.edu.au/flinders/app_templates/services/scheduled/getlivetonsley.cfm?refreshrate=7"
						style={{ height: "60em", width: "100%", border: "none" }}
						scrolling="auto">
	            </iframe>
            </div>
		);
	}
});

var TimedProgressBar = React.createClass({
	getInitialState: function() {
		return { going : false };
	},
	componentWillMount: function() {
		this.componentWillReceiveProps();
	},
	componentWillReceiveProps: function() {
		this.state.going = false;

		setTimeout(function() {
			this.forceUpdate();
		}.bind(this), 10);
	},
	render: function() {
		var ProgressBar = ReactBootstrap.ProgressBar;
		var widget = (
			<div className="progress slideIndicator">
			  <div className="progress-bar" style={{
			  	width : (this.state.going ? "100%" : "0%"),
			  	transition: 'width ' + (this.state.going ? this.props.duration : 0) + 'ms linear'
			  }}>
			  </div>
			</div>
			);

		this.state.going = true;
		return widget;
	}
});

React.renderComponent((
	<BuildingSlideshow slideTime="10000" code="IST" />
	), document.body);
