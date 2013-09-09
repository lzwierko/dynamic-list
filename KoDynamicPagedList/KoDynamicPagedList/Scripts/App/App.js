function ViewModel() {
    var self = this;
    self.dynamicList = {
        headers: ["Id", "Text", "Name"],
        pageSize: 200,
        token: undefined,
        supportCss2: true,
        clicable_columns: ["Text", "Name"],
        onClick: function (column, value) {
            alert(column + '=' + value);
        },
        hoverable_columns: ["name"],
        onInitialized: function (column, value, element) {
            if (column == 'Id') {
                $(element).attr("title", "Title is " + value);
                $(element).tooltip();
            }
        },
        onHoverIn: function (column, value, element) {
        },
        onHoverOut: function (column, value, element) {
        },
        getCount: function (callback) {
            $.getJSON('/items/List').done(function (data) {
                var count = data.Count;
                self.token = data.Token;
                callback(count);
            });

        },
        getItems: function (idx, count, sortBy, sortOrder, callback) {
            var url = '/items/List?idx=' + idx + '&count=' + count;
            if (sortBy != undefined && sortOrder != undefined) {
                url = url + '&sortBy=' + sortBy + "&sortOrder=" + sortOrder;
            }
            if (self.token != undefined) {
                url = url + '&token=' + self.token;
            }
            $.getJSON(url).done(function (data) {
                self.token = data.Token;
                callback(data.Items);
            });
        }
    };
};

$(function () {
    ko.applyBindings(new ViewModel());
});