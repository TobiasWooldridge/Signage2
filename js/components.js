/** @jsx React.DOM */
var Time = React.createClass({displayName: 'Time',
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
            React.DOM.time( {dateTime: rfcFormatted },  formatted )
            );
    }
});

var SignHeader = React.createClass({displayName: 'SignHeader',
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
            React.DOM.div( {className:"signHeader"}, 
                React.DOM.img( {className:"logo", src:"images/flinders-logo.png"} ),
                React.DOM.h1(null, "Welcome to ",  this.state.buildingData.name ),
                React.DOM.span( {className:"week"},  this.state.weekData.week,  " (", this.state.weekData.semester, ")")
            )
        );
    }
});

var BuildingBookings = React.createClass({displayName: 'BuildingBookings',
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
            React.DOM.tr( {className:classes}, 
                React.DOM.td(null,  room.code,  " ",  room.name ),
                React.DOM.td(null, RoomBooking( {booking: room.current_booking } )),
                React.DOM.td(null, RoomBooking( {booking: room.next_booking } ))
            )
            );
      });

        var Table = ReactBootstrap.Table;

        return (
            React.DOM.div(null, 
                React.DOM.h2(null,  this.props.code,  " Room Bookings"),
                Table( {condensed:true, className:"bookings"}, 
                    React.DOM.thead(null, 
                        React.DOM.tr(null, 
                            React.DOM.th( {className:"roomLabel"}, "Room"),
                            React.DOM.th( {className:"booking current"}, "Currently"),
                            React.DOM.th( {className:"booking next"}, "Next")
                        )
                    ),
                    React.DOM.tbody(null, 
                         roomNodes 
                    )
                )
            )
            );
    }
});


var RoomBooking = React.createClass({displayName: 'RoomBooking',
    render: function() {
        var booking = this.props.booking;


        if (!booking) {
            return React.DOM.span( {className:"booking empty"}, "Free"); 
        }


        var timeUntil = moment(booking.starts_at).format('X') - moment().format('X');
        var started = timeUntil < 0;

        if (timeUntil > 3600 * 24) {
            return React.DOM.span( {className:"booking empty"}, "Free"); 
        }

        return React.DOM.span( {className:"booking"},  booking.booked_for,  " ", React.DOM.small(null,  booking.description ), " ", Time( {clever:true, dateTime: booking.starts_at } ));
    }
});

var BuildingSlideshow = React.createClass({displayName: 'BuildingSlideshow',
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
            React.DOM.div( {className:"buildingSlideshow"}, 
                TimedProgressBar( {duration: slide.duration } ),
                SignHeader( {code: this.props.code } ),
                 slide.content 
            )
            );
    }
});

var NewsArticle = React.createClass({displayName: 'NewsArticle',
    render: function() {
      var article = this.props.article;
      return (
        React.DOM.article( {className:"news"}, 
            React.DOM.img( {className:"articleImage", src: article.image } ),
            React.DOM.h3(null,  article.title ),
            React.DOM.p(null,  article.plaintext )
        )
        );
    }
});     

var NewsFeed = React.createClass({displayName: 'NewsFeed',
    loadDataFromServer: function() {
        $unibuddy.getNews(function(building)  {return this.setState({ data: building });}.bind(this));
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
            return NewsArticle( {article: article } );
          });

        return (
            React.DOM.div( {className:"newsFeed"}, 
                React.DOM.h2(null, "News"),
                 newsNodes 
            )
            );
    }
});

var TimedProgressBar = React.createClass({displayName: 'TimedProgressBar',
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
            React.DOM.div( {className:"progress slideIndicator"}, 
                React.DOM.div( {className:"progress-bar", style:{
                    width : (this.state.going ? "100%" : "0%"),
                    transition: 'width ' + (this.state.going ? this.props.duration : 0) + 'ms linear'
                }}
                )
            )
            );

        this.state.going = true;
        return widget;
    }
});
