/** @jsx React.DOM */
(function() {
    var code = "IST";

    var slides = [
        new Slide(10000, <BuildingBookings code={ code } />),
        new Slide(10000, <NewsFeed polling={60000} />),
        new Slide(10000, <TonsleyFeed />)
    ];

    React.renderComponent((
        <BuildingSlideshow slides={ slides } code={ code } />
        ), document.body);
})();
