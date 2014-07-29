/** @jsx React.DOM */
var Time = React.createClass({
    render: function() {
        var datetime = moment(this.props.dateTime);
        var rfcFormatted = datetime.format("YYYY-MM-DDTHH:mm:ssZ");
        var formatted;

        var timeUntil = datetime.format('X') - moment().format('X');

        var isToday = datetime.format('YYYY-MM-DD') == moment().format('YYYY-MM-DD');

        if (this.props.clever) {
            console.log(timeUntil);
            if (isToday) {
                formatted = datetime.format("h A");
            }
            else {
                formatted = datetime.calendar();
            }
        }

        if (!formatted) {
            formatted = datetime.format(this.props.format || "YYYY-MM-DD h a");
        }

        return (
            <time dateTime={ rfcFormatted }>{ formatted }</time>
            );
    }
});

var SignHeader = React.createClass({
    loadBuildingDataFromServer: function() {
        $unibuddy.loadBuildingMeta(this.props.code, function(building) {
            this.setState({ buildingData: building });
        }.bind(this));
    },
    loadWeekDataFromServer: function() {
        $unibuddy.getWeek(function(week) {
            this.setState({ weekData: week });
        }.bind(this));
    },
    getInitialState: function() {
        return { buildingData : { code: "", name: "" }, weekData : { semester: "", week: "" }};
    },
    componentWillMount: function() {
        this.loadBuildingDataFromServer();
        this.loadWeekDataFromServer();
    },
    render: function() {
        return (
            <div className="signHeader">
                <img className="logo" src="images/flinders-logo.png" />
                <h1>Welcome to { this.state.buildingData.name }</h1>
                <span className="week">{ this.state.weekData.week } ({ this.state.weekData.semester })</span>
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
        var cx = React.addons.classSet;
        var roomNodes = this.state.data.map(function (room) {
          var classes = cx({
            room: true,
            empty: room.is_empty
        });

          return (
            <tr className={classes}>
                <td>{ room.code } { room.name }</td>
                <td><RoomBooking booking={ room.current_booking } /></td>
                <td><RoomBooking booking={ room.next_booking } /></td>
            </tr>
            );
      });

        var Table = ReactBootstrap.Table;

        return (
            <div>
                <h2>{ this.props.code } Room Bookings</h2>
                <Table condensed className="bookings">
                    <thead>
                        <tr>
                            <th className="roomLabel">Room</th>
                            <th className="booking current">Currently</th>
                            <th className="booking next">Next</th>
                        </tr>
                    </thead>
                    <tbody>
                        { roomNodes }
                    </tbody>
                </Table>
            </div>
            );
    }
});


var RoomBooking = React.createClass({
    render: function() {
        var booking = this.props.booking;


        if (!booking) {
            return <span className="booking empty">Free</span>; 
        }


        var timeUntil = moment(booking.starts_at).format('X') - moment().format('X');
        var started = timeUntil < 0;

        if (timeUntil > 3600 * 24) {
            return <span className="booking empty">Free</span>; 
        }

        return <span className="booking">{ booking.booked_for } <small>{ booking.description }</small> <Time clever dateTime={ booking.starts_at } /></span>;
    }
});

var BuildingSlideshow = React.createClass({
    getInitialState: function() {
        return {
            slide : undefined,
            slideNumber: -1
        };
    },
    componentWillMount: function() {
        var nextSlide = function() {
            try {
                this.state.slideNumber++;
                
                this.state.slide = this.props.slides[this.state.slideNumber % this.props.slides.length];
                
                this.forceUpdate();
            }
            catch (e) {
                console.error(e);
            }

            setTimeout(nextSlide, this.state.slide.duration);
        };

        nextSlide = nextSlide.bind(this);

        nextSlide();
    },
    render: function() {
        var slide = this.state.slide;
        return (
            <div className="buildingSlideshow">
                <TimedProgressBar duration={ slide.duration } />
                <SignHeader code={ this.props.code } />
                { slide.content }
            </div>
            );
    }
});

var NewsArticle = React.createClass({
    render: function() {
      var article = this.props.article;
      return (
        <article className="news">
            <img className="articleImage" src={ article.image } />
            <h3>{ article.title }</h3>
            <p>{ article.plaintext }</p>
        </article>
        );
    }
});     

var NewsFeed = React.createClass({
    loadDataFromServer: function() {
        $unibuddy.getNews(building => this.setState({ data: building }));
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
        var newsNodes = this.state.data.slice(0, 2).map(function (article) {
            return <NewsArticle article={ article } />;
          });

        return (
            <div className="newsFeed">
                <h2>News</h2>
                { newsNodes }
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
