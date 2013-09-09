ko.bindingHandlers.dynamicList = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = valueAccessor();
        var listDesc = ko.unwrap(value);
        value.__ko_dl_obj = new DynamicList(listDesc, element);
        value.__ko_dl_obj.inititalize();
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var value = valueAccessor();
        value.__ko_dl_obj.updateItems();
    }
};