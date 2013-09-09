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

function DynamicList(config) {
    var self = this;
    self.headers = config.headers;
    self.pageSize = config.pageSize;
    self.getCount = config.getItemsCountFun;
    self.getItems = config.getItemsFun;
    self.itemIdx = 0;
    self.itemsCount = undefined;
    self.items = [];
    self.sortBy = undefined;
    self.sortOrder = undefined;

    self.updateCount = function () {
        self.getCount(function (count) {
            self.itemsCount = count;
        });
    };

    self.updateItems = function (element) {
        if (self.itemsCount == undefined) {
            self.getCount(function (count) {
                self.itemsCount = count;
                self.updateItemsImpl(element);
            });
            return;
        }
        self.updateItemsImpl(element);
    };

    self.updateItemsImpl = function (element) {
        if (self.itemsCount == undefined || self.itemsCount <= 0)
            return;
        self.getItems(self.itemIdx, self.pageSize, function (items) {
            self.items = items;
            self.redraw(element, self);
        });
    };

    self.redraw = function (element, model) {
        var e = element;
        // table        
        var tbl = document.createElement("table");
        tbl.className = "ko_dl-table";
        // header
        var trh = document.createElement("tr");
        trh.className = "ko_dl-trh";
        _.each(config.headers, function (v) {
            var th = document.createElement("th");
            var a = document.createElement("a");
            a.href = "#";
            a.onclick = function () {               
                if (model.sortBy == v) {
                    if (model.sortOrder == 'asc')
                        model.sortOrder = 'desc';
                    else
                        model.sortOrder = 'asc';
                }
                
                model.updateItems(element);
            };
            a.innerHTML = v;
            th.appendChild(a);
            trh.appendChild(th);
        });
        tbl.appendChild(trh);
        // rows
        _.each(self.items, function (i) {
            var tr = document.createElement("tr");
            tr.className = "ko_dl-tr";
            _.each(config.headers, function (h) {
                var td = document.createElement("td");
                td.innerHTML = i[h];
                tr.appendChild(td);
            });
            tbl.appendChild(tr);
        });

        // bottom control panel
        // first
        var tdFirst = document.createElement("td");
        tdFirst.className = "ko_dl-ctrl-first";

        var aFirst = document.createElement("a");
        aFirst.innerHTML = "&lt&lt&lt";
        aFirst.href = "#";
        aFirst.className = "ko_dl-ctrl-first-a";
        tdFirst.appendChild(aFirst);
        if (model.itemIdx >= model.pageSize) {
            aFirst.onclick = function () {
                model.itemIdx = 0;
                model.updateItems(element);
            };
        }
        else {
            aFirst.className = "ko_dl-ctrl-first-a-disabled";
            aFirst.disabled = true;
        }
        // prev
        var tdPrev = document.createElement("td");
        tdPrev.className = "ko_dl-ctrl-prev";

        var aPrev = document.createElement("a");
        aPrev.innerHTML = "&lt&lt";
        aPrev.href = "#";
        aPrev.className = "ko_dl-ctrl-prev-a";

        tdPrev.appendChild(aPrev);
        if (model.itemIdx >= model.pageSize) {
            aPrev.onclick = function () {
                model.itemIdx = model.itemIdx - model.pageSize;
                if (model.itemIdx < 0)
                    model.itemIdx = 0;
                model.updateItems(element);
            };
        } else {
            aPrev.className = "ko_dl-ctrl-prev-a-disabled";
            aPrev.disabled = true;
        }
        // pages
        var tdPages = document.createElement("td");
        tdPages.className = "ko_dl-ctrl-pages";
        // next
        var tdNext = document.createElement("td");
        tdNext.className = "ko_dl-ctrl-next";

        var aNext = document.createElement("a");
        aNext.innerHTML = "&gt&gt";
        aNext.href = "#";
        aNext.className = "ko_dl-ctrl-next-a";
        aNext.onclick = function () {
            model.itemIdx += model.pageSize;
            model.updateItems(element);
        };
        tdNext.appendChild(aNext);
        if (model.itemIdx + model.pageSize < model.itemsCount) {
            aNext.onclick = function () {
                model.itemIdx += model.pageSize;
                model.updateItems(element);
            };
        } else {
            aNext.className = "ko_dl-ctrl-next-a-disabled";
            aNext.disabled = true;
        }
        // last
        var tdLast = document.createElement("td");
        tdLast.className = "ko_dl-ctrl-last";

        var aLast = document.createElement("a");
        aLast.innerHTML = "&gt&gt&gt";
        aLast.href = "#";
        aLast.className = "ko_dl-ctrl-first-a";
        aLast.onclick = function () {
            model.itemIdx = model.itemsCount - model.pageSize;
            model.updateItems(element);
        };
        tdLast.appendChild(aLast);
        if (model.itemIdx + model.pageSize < model.itemsCount) {
            aLast.onclick = function () {
                model.itemIdx = model.itemsCount - model.pageSize;
                model.updateItems(element);
            };
        }
        else {
            aLast.className = "ko_dl-ctrl-last-a-disabled";
            aLast.disabled = true;
        }

        var tblRow = document.createElement("tr");
        tblRow.className = "ko_dl-ctrl-tr";
        tblRow.appendChild(tdFirst);
        tblRow.appendChild(tdPrev);
        tblRow.appendChild(tdPages);
        tblRow.appendChild(tdNext);
        tblRow.appendChild(tdLast);
        var tblCtrl = document.createElement("table");
        tblCtrl.className = "ko_dl-ctrl-table";
        tblCtrl.appendChild(tblRow);


        var tdCtrl = document.createElement("td");
        tdCtrl.appendChild(tblCtrl);
        tdCtrl.className = "ko_dl-td-ctrl";
        tdCtrl.colSpan = 3;
        var trCtrl = document.createElement("tr");
        trCtrl.className = "ko_dl-tr-ctrl";
        trCtrl.appendChild(tdCtrl);
        tbl.appendChild(trCtrl);

        e.innerHTML = "";
        var div = document.createElement("div");
        div.appendChild(tbl);
        e.appendChild(div);
    };
}
