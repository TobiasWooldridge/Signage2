/** @jsx React.DOM */
(function() {
    var building = "IST";

    var slides = [
        new Slide(10000, <BuildingBookings code={ building } />),
        new Slide(10000, <NewsFeed polling={60000} />),
        new Slide(10000, <TonsleyFeed />)
    ];

    React.renderComponent((
        <BuildingSlideshow slides={ slides } code={ building } />
        ), document.body);
})();
