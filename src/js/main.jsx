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
				<h1>Welcome to { this.state.data.name }!</h1>
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
	    var roomNodes = this.state.data.map(function (room) {
	      return <li><Room room={room} /></li>;
	    });

		return (
			<ul>
				{ roomNodes }
			</ul>
		);
	}
});


var Room = React.createClass({
	render: function() {
		var room = this.props.room;

		return (
	      	<div>{ room.building_code } { room.code } <br />
	      	Current booking: <RoomBooking booking={ room.current_booking } /> <br />
	      	Next booking: <RoomBooking booking={ room.next_booking } /></div>
		);
	}
});

var RoomBooking = React.createClass({
	render: function() {
		var booking = this.props.booking;

		if (!booking) {
			// hack for returning nothing, see https://github.com/facebook/react/issues/108
			return <span />; 
		}
		return <span>{ booking.description } on <Time dateTime={ booking.starts_at } /></span>;
	}
});

var BuildingSlideshow = React.createClass({
	getInitialState: function() {
		return { slide : 0 };
	},
	componentWillMount: function() {
		setInterval(function() { this.state.slide++; }.bind(this), this.props.slideTime);
	},
	render: function() {
		var numSlides = 2;

		this.state.slide = this.state.slide % numSlides;

		var code = this.props.code;
		var slide = (
			<BuildingBookings code={ code } />
		);

		return (
			<div className="buildingSlideshow">
				<BuildingMeta code={ code } />
				{ slide }
			</div>
		);
	}
});

React.renderComponent((
	<BuildingSlideshow slideTime="10000" code="IST" />
	), document.getElementById("moo"));