/** @jsx React.DOM */
var TonsleyFeed = React.createClass({
    render: function() {
        return (
            <div class="tonsleyFeed">
                <h2>Tonsley Live Feed</h2>
                <iframe src="http://www.flinders.edu.au/flinders/app_templates/services/scheduled/getlivetonsley.cfm?refreshrate=7"
                style={{ height: "60em", width: "100%", border: "none" }}
                scrolling="auto"></iframe>
            </div>
            );
    }
});

// Start everything
(function() {
    var building = "IST";

    var slides = [
        new Slide(10000, <BuildingBookings code={ building } />),
        new Slide(10000, <NewsFeed polling={60000} />),
        new Slide(8000, <TonsleyFeed />)
    ];

    React.renderComponent((
        <BuildingSlideshow slides={ slides } code={ building } />
        ), document.body);
})();
