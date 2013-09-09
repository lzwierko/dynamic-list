// dynamic list, view model needs to have
// 1. columns headers - ordered list of headers
// --2. sortBy - name of column to sort
// --3. sortOrder - asc or desc
// 4. pageSize - size of page to display ( informative only)
// 5. getItemsCountFun - function to obtain items count
// 6. getItemsFun(idx,size, string sortBy, string sort) - function to obtain items


//element — The DOM element involved in this binding
//valueAccessor — A JavaScript function that you can call to get the current model property that is involved in this binding. 
//    Call this without passing any parameters (i.e., call valueAccessor()) to get the current model property value. 
//        To easily accept both observable and plain values, call ko.unwrap on the returned value.
//allBindingsAccessor — A JavaScript function that you can call to get all the model properties bound to this DOM element. 
//    Like valueAccessor, call it without any parameters to get the current bound model properties.
//viewModel — The view model object that was passed to ko.applyBindings. Inside a nested binding context, this parameter will be set to the current data item
//(e.g., inside a with: person binding, viewModel will be set to person).
//    bindingContext — An object that holds the binding context available to this element’s bindings.
//        This object includes special properties including $parent, $parents, and $root that can be used to access data that is bound against ancestors of this context.

function DynamicList(config, element) {
    var self = this;
    self.headers = config.headers;
    self.pageSize = config.pageSize;
    self.getCount = config.getCount;
    self.getItems = config.getItems;
    self.onInitialized = config.onInitialized;

    self.clicable_columns = config.clicable_columns;
    self.onClick = config.onClick;

    self.sortImgWidth = config.sortImgWidth == undefined ? '15px' : config.sortImgWidth;
    self.sortImgHeight = config.sortImgHeight == undefined ? '15px' : config.sortImgHeight;
    self.sortImgAsc = config.sortImgAsc == undefined ? '/Images/ko-dl-asc.png' : config.sortImgAsc;
    self.sortImgDsc = config.sortImgDsc == undefined ? '/Images/ko-dl-dsc.png' : config.sortImgDsc;

    self.supportCss2 = config.supportCss2;

    self.itemIdx = 0;
    self.itemsCount = undefined;
    self.items = [];
    self.sortBy = undefined;
    self.sortOrder = undefined;

    self.element = element;
    self.mainDiv = undefined;
    self.tableDiv = undefined;
    self.pagingDiv = undefined;

    self.updateItems = function () {
        if (self.itemsCount == undefined) {
            self.getCount(function (count) {
                self.itemsCount = count;
                self.drawPager();
                self.updateItemsImpl(element);
            });
            return;
        }
        self.updateItemsImpl();
    };

    self.updateItemsImpl = function () {
        if (self.itemsCount == undefined || self.itemsCount <= 0)
            return;
        self.getItems(self.itemIdx, self.pageSize, self.sortBy, self.sortOrder, function (items) {
            self.items = items;
            self.redraw();
        });
    };

    self.drawPager = function () {
        var pageCount = Math.ceil(self.itemsCount / self.pageSize);
        $(self.pagingDiv).paginate({
            count: pageCount,
            start: 1,
            display: 13,
            border: false,
            text_color: '#79B5E3',
            background_color: 'none',
            text_hover_color: '#2573AF',
            background_hover_color: 'none',
            images: false,
            mouse: 'click',
            onChange: function (page) {
                self.itemIdx = (page - 1) * self.pageSize;
                self.updateItemsImpl();
            }
        });

        //var div = $('<div/>');
        //var table = $('<table/>').append($('<tr/>').append($('<td/>').append(div)));
        //$(self.pagingDiv).append(table);

        //var pageCount = Math.ceil(self.itemsCount / self.pageSize);
        //$(div).paginate({
        //    count: pageCount,
        //    start: 1,
        //    display: 13,
        //    border: false,
        //    text_color: '#79B5E3',
        //    background_color: 'none',
        //    text_hover_color: '#2573AF',
        //    background_hover_color: 'none',
        //    images: false,
        //    mouse: 'click',
        //    onChange: function (page) {
        //        self.itemIdx = (page - 1) * self.pageSize;
        //        self.updateItemsImpl();
        //    }
        //});

    };

    self.inititalize = function () {
        var e = self.element;
        self.mainDiv = $('<div/>').addClass('ko-dl-main-div');
        self.tableDiv = $('<div/>').addClass('ko-dl-table-div');
        var pagingDivOuter = $('<div/>').addClass('ko-dl-paging-div');
        self.pagingDiv = $('<div/>');
        pagingDivOuter.append(self.pagingDiv);
        self.mainDiv.append(self.tableDiv).append(pagingDivOuter);
        $(e).append(self.mainDiv);
        //self.drawPager();
    };

    self.redraw = function () {
        var e = self.tableDiv;
        // table        
        var tbl = $('<table/>').addClass('ko-dl-table');
        // header        
        var trh = $('<tr/>').addClass('ko-dl-trh');
        _.each(config.headers, function (v) {
            var a = $('<a class="ko-dl-trh-a"/>').attr('href', '#').click(function () {
                if (self.sortBy == v) {
                    if (self.sortOrder == 'asc')
                        self.sortOrder = 'dsc';
                    else
                        self.sortOrder = 'asc';
                } else {
                    self.sortBy = v;
                    self.sortOrder = 'asc';
                }
                self.updateItems(element);
            });
            a.append($('<span class="ko-dl-th-a-text"/>').text(v));
            if (v == self.sortBy) {
                var cl = "ko-dl-th-a-sort-img-" + self.sortOrder;
                var imgSrc = self.sortOrder == 'asc' ? self.sortImgAsc : self.sortImgDsc;
                var img = $("<img/>").attr('src', imgSrc).attr('width', self.sortImgWidth).attr('height', self.sortImgHeight).addClass('ko-dl-th-a-sort-img').addClass(cl);
                a.append(img);
            }
            var th = $('<th/>').append(a);
            trh.append(th);

        });
        tbl.append($('<thead/>').append(trh));
        // rows
        var even = true;
        var tbody = $('<tbody/>');
        _.each(self.items, function (i) {
            var tr = $('<tr/>').addClass('ko-dl-tr');
            if (self.supportCss2) {
                tr.addClass(even ? 'ko-dl-tr-even' : 'ko-dl-tr-odd');
                even = !even;
            }
            _.each(config.headers, function (h) {
                var td = $('<td/>').text(i[h]);
                if (_.contains(self.clicable_columns, h)) {
                    td.addClass('ko-dl-table-td-clicable').click(function () {
                        self.onClick(h, i[h]);
                    });
                }
                tr.append(td);
                if (self.onInitialized != undefined)
                    self.onInitialized(h, i[h], td);

            });
            tbody.append(tr);
        });
        // build
        $(e).html(tbl.append(tbody));
    };
}
